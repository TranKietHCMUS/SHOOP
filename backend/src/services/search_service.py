import math
import itertools
import requests
from typing import Dict, List, Tuple
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from pydantic import ValidationError

from src.models.search_model import SearchRequestModel
from src.config import Config


class SearchService:
    """
    Find best route follow distance and price.
    Sử dụng pre-selection + enumeration + OR-Tools Routing (TSP).
    """

    def __init__(self, lambda_dist: float = 0.1, preselect_k: int = 3, top_k: int = 3):
        self.lambda_dist = lambda_dist
        self.preselect_k = preselect_k
        self.top_k = top_k

    @staticmethod
    def _haversine(a: Tuple[float, float], b: Tuple[float, float]) -> float:
        R = 6371  # radius eatrch (km)
        lat1, lon1 = map(math.radians, a)
        lat2, lon2 = map(math.radians, b)
        dlat, dlon = lat2 - lat1, lon2 - lon1
        h = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
        return 2 * R * math.asin(math.sqrt(h))

    @staticmethod
    def _create_distance_matrix(locs: List[Tuple[float, float]], force_haversine: bool = False):
        """
        Matrix distance using Haversine only. Google Distance Matrix API is not used.
        Return: (distance_matrix, duration_matrix) (meters, seconds)
        """
        n = len(locs)
        dist_mat = [[0] * n for _ in range(n)]
        dur_mat = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i == j:
                    dist_mat[i][j] = 0
                    dur_mat[i][j] = 0
                else:
                    d_km = SearchService._haversine(locs[i], locs[j])
                    dist_mat[i][j] = int(d_km * 1000)  # meters
                    dur_mat[i][j] = int(dist_mat[i][j] / 8.33)
        return dist_mat, dur_mat
    @staticmethod
    def _reverse_geocode(lat: float, lng: float) -> str:
        """Call Google Geocoding API to get address from lat/lng."""
        api_key = getattr(Config, 'GGMAP_API_KEY', None)
        if not api_key:
            return f"({lat}, {lng})"
        
        url = (
            "https://maps.googleapis.com/maps/api/geocode/json"
            f"?latlng={lat},{lng}"
            f"&key={api_key}"
        )
        try:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()  # sẽ throw nếu HTTP status != 200
            data = resp.json()
            
            status = data.get('status', '')
            if status != 'OK':
                logging.warning("Geocoding API returned %s: %s", status, data.get('error_message'))
                return f"({lat}, {lng})"
            
            results = data.get('results', [])
            if not results:
                logging.info("No results for %s,%s", lat, lng)
                return f"({lat}, {lng})"
            
            return results[0].get('formatted_address', f"({lat}, {lng})")
        
        except requests.exceptions.RequestException as e:
            logging.error("HTTP error during reverse geocode: %s", e)
        except ValueError as e:
            logging.error("Invalid JSON from Geocoding API: %s", e)
        except Exception as e:
            logging.exception("Unexpected error in _reverse_geocode")
        
        return f"({lat}, {lng})"
    
    @staticmethod
    def _solve_tsp_ortools(
        locs: List[Tuple[float, float]],
        use_duration: bool = False
    ) -> Tuple[List[int], float, float]:
        """
        Trả về (route_nodes, total_distance_km, total_duration_s)
        route_nodes là list các node index: 0=user_loc, 1..n=các store theo thứ tự đi
        (không quay về điểm xuất phát)
        """
        n = len(locs)
        dist_mat, dur_mat = SearchService._create_distance_matrix(locs)
        mat = dur_mat if use_duration else dist_mat

        manager = pywrapcp.RoutingIndexManager(n, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def cost(i, j):
            return mat[manager.IndexToNode(i)][manager.IndexToNode(j)]
        transit = routing.RegisterTransitCallback(cost)
        routing.SetArcCostEvaluatorOfAllVehicles(transit)
        routing.AddDimension(transit, 0, 10**9, True, 'Distance')

        params = pywrapcp.DefaultRoutingSearchParameters()
        params.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        sol = routing.SolveWithParameters(params)
        if sol is None:
            raise RuntimeError('TSP solution not found')

        # Lấy thứ tự node (path) mà không thêm điểm quay về
        route_nodes = []
        idx = routing.Start(0)
        total_dist = 0
        total_dur = 0
        while not routing.IsEnd(idx):
            node = manager.IndexToNode(idx)
            route_nodes.append(node)
            nxt = sol.Value(routing.NextVar(idx))
            total_dist += dist_mat[node][manager.IndexToNode(nxt)]
            total_dur  += dur_mat[node][manager.IndexToNode(nxt)]
            idx = nxt

        return route_nodes, total_dist / 1000.0, total_dur

    def get_top_k_plans(
        self,
        stores: Dict[str, dict],
        groups: List[List[int]],
        user_loc: Tuple[float, float]
    ) -> List[dict]:
        try:
            req = SearchRequestModel(stores=stores, groups=groups, user_loc=user_loc)
        except ValidationError as e:
            raise ValueError(f"Invalid input data: {e}")

        stores_valid = {sid: model.dict() for sid, model in req.stores.items()}
        groups_valid = req.groups
        user_loc_valid = req.user_loc

        # 1) Pre-selection
        candidates = set()
        for g in groups_valid:
            priced = []
            for s, d in stores_valid.items():
                vals = [d['items'][i] for i in g if i in d['items']]
                if vals:
                    priced.append((min(vals), s))
            priced.sort(key=lambda x: x[0])
            candidates.update(s for _, s in priced[:self.preselect_k])
        cands = list(candidates)

        plans = []
        plan_id = 1
        for r in range(1, len(cands) + 1):
            for subset in itertools.combinations(cands, r):
                total_price = 0.0
                ok = True
                for g in groups_valid:
                    pmin = float('inf')
                    for s in subset:
                        vals = [stores_valid[s]['items'][i] for i in g if i in stores_valid[s]['items']]
                        if vals:
                            pmin = min(pmin, min(vals))
                    if pmin == float('inf'):
                        ok = False
                        break
                    total_price += pmin
                if not ok:
                    continue

                # Chuẩn bị locs và gọi TSP
                locs = [user_loc_valid] + [stores_valid[s]['coord'] for s in subset]
                route_nodes, dist, duration = self._solve_tsp_ortools(locs)

                # Build waypoints & coordinates theo route_nodes
                waypoints = []
                coordinates = []
                for node in route_nodes:
                    if node == 0:
                        waypoints.append("user location")
                        coordinates.append(user_loc_valid)
                    else:
                        store_key = subset[node - 1]  # node=1→subset[0],…
                        info = stores_valid[store_key]
                        waypoints.append(info.get('name', store_key))
                        coordinates.append(info['coord'])

                plans.append({
                    'start': self._reverse_geocode(user_loc_valid[0], user_loc_valid[1]),
                    'end': waypoints[-1] if waypoints else '',
                    'cost': round(total_price, 2),
                    'distance': round(dist, 2),
                    'duration': duration,
                    'coordinates': [
                        {'lat': lat, 'lng': lng} for lat, lng in coordinates
                    ],
                    'waypoints': waypoints
                })
                plan_id += 1

        return plans[:self.top_k]

    def get_shortest_distance_plans(
        self,
        stores: Dict[str, dict],
        groups: List[List[int]],
        user_loc: Tuple[float, float]
    ) -> List[dict]:
        """
        Tối ưu theo quãng đường (nhỏ nhất) nhưng vẫn đưa ra 'cost' để tham khảo.
        """
        try:
            req = SearchRequestModel(stores=stores, groups=groups, user_loc=user_loc)
        except ValidationError as e:
            raise ValueError(f"Invalid input data: {e}")

        stores_valid = {sid: model.dict() for sid, model in req.stores.items()}
        groups_valid = req.groups
        user_loc_valid = req.user_loc

        # 1) Tập candidates: tất cả store có thể cung cấp ít nhất 1 item
        candidates = [
            sid for sid, info in stores_valid.items()
            if any(i in info['items'] for grp in groups_valid for i in grp)
        ]

        plans = []
        plan_id = 1

        # 2) Enumerate mọi kích thước subset
        for r in range(1, len(candidates) + 1):
            for subset in itertools.combinations(candidates, r):
                # 2.a) Tính cost (vẫn cần cover đủ groups)
                total_price = 0.0
                ok = True
                for grp in groups_valid:
                    pmin = float('inf')
                    for s in subset:
                        vals = [stores_valid[s]['items'][i] for i in grp if i in stores_valid[s]['items']]
                        if vals:
                            pmin = min(pmin, min(vals))
                    if pmin == float('inf'):
                        ok = False
                        break
                    total_price += pmin
                if not ok:
                    continue

                # 2.b) Tính TSP trên locs = [user] + coords của subset
                locs = [user_loc_valid] + [stores_valid[s]['coord'] for s in subset]
                route_nodes, dist, duration = self._solve_tsp_ortools(locs)

                # 2.c) Build waypoints & coordinates
                waypoints = []
                coordinates = []
                for node in route_nodes:
                    if node == 0:
                        waypoints.append("user location")
                        coordinates.append(user_loc_valid)
                    else:
                        store_key = subset[node - 1]
                        info = stores_valid[store_key]
                        waypoints.append(info.get('name', store_key))
                        coordinates.append(info['coord'])

                plans.append({
                    'id': plan_id,
                    'cost': round(total_price, 2),
                    'distance': round(dist, 2),
                    'duration': duration,
                    'coordinates': [
                        {'lat': lat, 'lng': lng}
                        for lat, lng in coordinates
                    ],
                    'waypoints': waypoints
                })
                plan_id += 1

        # 3) Sắp xếp theo quãng đường (không phải cost) và trả về top-k
        plans.sort(key=lambda x: x['distance'])
        return plans[:self.top_k]

    def get_plans_from_nearby(
        self,
        stores_list: List[dict],
        user_loc: Tuple[float, float]
    ) -> List[dict]:
        """
        Accepts output of get_products_for_stores_within_radius (list of stores with address, lat, lng, items)
        and computes top-k plans.
        """
        if not stores_list:
            return []
        # Lọc bỏ các store không có candidate nào cho bất kỳ item nào
        filtered_stores = []
        for store in stores_list:
            items = store.get("items", [])
            if all(info.get("candidates") for info in items):
                filtered_stores.append(store)
        if not filtered_stores:
            return []
        # Determine number of items and group count from first store
        first_store = filtered_stores[0]
        item_infos = first_store.get("items", [])
        num_items = len(item_infos)
        # Each item has 'candidates' list
        group_count = min(
            len(info.get("candidates", [])) for info in item_infos
        ) if item_infos else 0

        # Build stores dict for internal search
        stores_for_search: Dict[str, dict] = {}
        for store in filtered_stores:
            address = store.get("address")
            lat = store.get("lat")
            lng = store.get("lng")
            item_map: Dict[int, float] = {}
            for idx_item, info in enumerate(store.get("items", [])):
                qty = info.get("quantity", 1)
                candidates = info.get("candidates", [])
                for j in range(group_count):
                    if j < len(candidates):
                        price_val = candidates[j].get("price", 0) or 0
                        # flatten index: item_index * group_count + candidate_index
                        flat_index = idx_item * group_count + j
                        item_map[flat_index] = price_val * qty
            stores_for_search[address] = {
                "coord": (lat, lng),
                "items": item_map
            }

        # Build groups: list of flat indices for each candidate position across items
        groups: List[List[int]] = []
        for j in range(group_count):
            group = [i * group_count + j for i in range(num_items)]
            groups.append(group)

        # Delegate to existing get_top_k_plans
        return self.get_top_k_plans(
            stores=stores_for_search,
            groups=groups,
            user_loc=user_loc
        )
