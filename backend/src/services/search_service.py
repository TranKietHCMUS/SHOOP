import math
import itertools
from typing import Dict, List, Tuple
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from pydantic import ValidationError

from src.models.search_model import SearchRequestModel


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
    def _create_distance_matrix(locs: List[Tuple[float, float]]) -> List[List[int]]:
        n = len(locs)
        mat = [[0] * n for _ in range(n)]
        for i, a in enumerate(locs):
            for j, b in enumerate(locs):
                mat[i][j] = int(SearchService._haversine(a, b) * 1000)
        return mat

    @staticmethod
    def _solve_tsp_ortools(locs: List[Tuple[float, float]]) -> float:
        n = len(locs)
        dist_mat = SearchService._create_distance_matrix(locs)
        manager = pywrapcp.RoutingIndexManager(n, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def cost(i, j):
            return dist_mat[manager.IndexToNode(i)][manager.IndexToNode(j)]

        transit = routing.RegisterTransitCallback(cost)
        routing.SetArcCostEvaluatorOfAllVehicles(transit)
        routing.AddDimension(transit, 0, 10**9, True, 'Distance')

        params = pywrapcp.DefaultRoutingSearchParameters()
        params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        sol = routing.SolveWithParameters(params)
        if sol is None:
            raise RuntimeError('TSP solution not found')

        idx = routing.Start(0)
        total = 0
        while not routing.IsEnd(idx):
            nxt = sol.Value(routing.NextVar(idx))
            total += routing.GetArcCostForVehicle(idx, nxt, 0)
            idx = nxt
        return total / 1000.0

    def get_top_k_plans(
        self,
        stores: Dict[str, dict],
        groups: List[List[int]],
        user_loc: Tuple[float, float]
    ) -> List[dict]:
        # Validate input dât
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

        # 2) Enumerate and find score
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

                locs = [user_loc_valid] + [stores_valid[s]['coord'] for s in subset]
                dist = self._solve_tsp_ortools(locs)
                # Fake duration: 1km = 6 phút
                duration = int(dist * 6)
                # Waypoints: tên store, có thể thêm điểm trung gian nếu muốn
                waypoints = []
                coordinates = []
                # Start
                if subset:
                    start_name = list(stores_valid[subset[0]].get('name', str(subset[0])))
                    end_name = list(stores_valid[subset[-1]].get('name', str(subset[-1])))
                else:
                    start_name = end_name = ""
                # Lấy tên store nếu có
                store_names = [stores_valid[s].get('name', str(s)) for s in subset]
                waypoints = store_names
                coordinates = [user_loc_valid] + [stores_valid[s]['coord'] for s in subset]
                # Format output
                plans.append({
                    'id': plan_id,
                    'start': store_names[0] if store_names else '',
                    'end': store_names[-1] if store_names else '',
                    'cost': round(total_price, 2),  # total cost of items
                    'distance': round(dist, 2),
                    'duration': duration,
                    'coordinates': [{'lat': c[0], 'lng': c[1]} for c in coordinates],
                    'waypoints': waypoints
                })
                plan_id += 1
        plans = plans[:self.top_k]
        return plans

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
