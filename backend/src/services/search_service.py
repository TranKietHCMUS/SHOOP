import math
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import logging
import requests
from typing import Dict, List, Tuple, Set, Optional
import re 
from haversine import haversine  # Added import
from src.config import Config

logger = logging.getLogger(__name__)

class SearchService:
    # Parameter to scale distance cost
    DEFAULT_DISTANCE_COST_PER_KM = 500
    DEFAULT_ITEM_PRICE_SCALE_FACTOR = 1
    DEFAULT_TIME_LIMIT_SECONDS = 3
    DEFAULT_AVERAGE_SPEED_KMH = 25

    def __init__(self, distance_cost_per_km=None, item_price_scale_factor=None, time_limit_seconds=None, average_speed_kmh=None):
        self.distance_cost_per_km = distance_cost_per_km if distance_cost_per_km is not None else self.DEFAULT_DISTANCE_COST_PER_KM
        self.item_price_scale_factor = item_price_scale_factor if item_price_scale_factor is not None else self.DEFAULT_ITEM_PRICE_SCALE_FACTOR
        self.time_limit_seconds = time_limit_seconds if time_limit_seconds is not None else self.DEFAULT_TIME_LIMIT_SECONDS
        self.average_speed_kmh = average_speed_kmh if average_speed_kmh is not None else self.DEFAULT_AVERAGE_SPEED_KMH
        self.logger = logging.getLogger(__name__)
    
    @staticmethod    
    def _reverse_geocode(lat: float, lng: float) -> str:
        """Call OpenRouteService Reverse Geocoding API to get address from lat/lng."""
        from src.config import Config
        api_key = getattr(Config, 'ORS_API_KEY', None)
        if not api_key:
            logging.error("OpenRouteService API key not found in Config.ORS_API_KEY")
            return f"({lat}, {lng})"
        url = "https://api.openrouteservice.org/geocode/reverse"
        headers = {
            "Authorization": api_key,
            "Accept": "application/json"
        }
        params = {
            "point.lat": lat,
            "point.lon": lng,
            "size": 1
        }
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=2)
            resp.raise_for_status()
            data = resp.json()
            features = data.get("features", [])
            if features and "properties" in features[0]:
                address = features[0]["properties"].get("label")
                if address:
                    return address
            logging.info("No reverse-geocode result for %s,%s: %s", lat, lng, data)
            return f"({lat}, {lng})"
        except requests.exceptions.RequestException as e:
            logging.error("HTTP error during ORS reverse geocode: %s", e)
        except ValueError as e:
            logging.error("Invalid JSON from ORS API: %s", e)
        except Exception as e:
            logging.exception("Unexpected error in _reverse_geocode")
        return f"({lat}, {lng})"

    def _get_distance_matrix_ors(self, locations: list) -> list:
        """
        Call OpenRouteService API to get the distance matrix (in meters) for a list of (lat, lng) tuples.
        Returns a 2D list of distances in kilometers.
        """
        api_key = getattr(Config, 'ORS_API_KEY', None)
        if not api_key:
            logger.error("OpenRouteService API key not found in Config.ORS_API_KEY")
            raise Exception("ORS API key missing")
        url = "https://api.openrouteservice.org/v2/matrix/driving-car"
        headers = {
            'Authorization': api_key,
            'Content-Type': 'application/json'
        }
        coords = [[lng, lat] for lat, lng in locations]  # ORS expects [lng, lat]
        payload = {
            "locations": coords,
            "metrics": ["distance"],
            "units": "km"
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if "distances" in data:
                return data["distances"]
            else:
                logger.error(f"ORS matrix response missing 'distances': {data}")
                raise Exception("ORS matrix response invalid")
        except Exception as e:
            logger.error(f"ORS matrix API error: {e}")
            raise

    def _prepare_data_model(self, stores_input, user_loc_input, req_groups_input):
        data = {}
        locations = [] 
        item_prices_at_nodes_original = [] 
        node_to_store_map = {} 
        task_nodes_for_group = [[] for _ in req_groups_input]

        try:
            user_lat = float(user_loc_input['lat'])
            user_lng = float(user_loc_input['lng'])
            locations.append((user_lat, user_lng)) 
        except (ValueError, TypeError, KeyError) as e:
            logger.error(f"Invalid user location format: {user_loc_input}. Error: {e}")
            return None

        or_tools_node_idx_counter = 1 
        location_idx_counter = 1      

        location_map_cache = {(user_lat, user_lng): 0} 
        store_location_indices = {} 

        for store_id, store_info in stores_input.items():
            try:
                store_lat = float(store_info['lat'])
                store_lng = float(store_info['lng'])
            except (ValueError, TypeError, KeyError) as e:
                logger.warning(f"Skipping store {store_id} due to invalid coordinates/format. Error: {e}")
                continue

            loc_tuple = (store_lat, store_lng)
            if loc_tuple in location_map_cache:
                store_loc_idx = location_map_cache[loc_tuple]
            else:
                locations.append(loc_tuple)
                store_loc_idx = location_idx_counter
                location_map_cache[loc_tuple] = store_loc_idx
                location_idx_counter += 1
            store_location_indices[store_id] = store_loc_idx

            for item_id, price in store_info.get('items', {}).items():
                try:
                    item_price_float = float(price)
                except (ValueError, TypeError):
                    logger.warning(f"Skipping item {item_id} at {store_id} due to invalid price: {price}")
                    continue

                for group_idx, group_set in enumerate(req_groups_input):
                    if item_id in group_set:
                        current_or_tools_node_idx = or_tools_node_idx_counter
                        item_prices_at_nodes_original.append(item_price_float)
                        node_to_store_map[current_or_tools_node_idx] = store_loc_idx
                        task_nodes_for_group[group_idx].append(current_or_tools_node_idx)
                        or_tools_node_idx_counter += 1
                        break 
        
        data['locations'] = locations
        data['item_prices_at_nodes_original'] = [0.0] + item_prices_at_nodes_original
        if len(data['item_prices_at_nodes_original']) != or_tools_node_idx_counter:
             logger.error("CRITICAL: Mismatch in item_prices_at_nodes_original length and node count.")
             return None

        data['node_to_store_map'] = node_to_store_map
        data['task_nodes_for_group'] = task_nodes_for_group
        data['num_vehicles'] = 1
        data['depot'] = 0 
        data['num_nodes'] = or_tools_node_idx_counter 

        data['stores_info_orig'] = stores_input 
        data['user_loc_info_orig'] = user_loc_input 
        data['req_groups_info_orig'] = req_groups_input
        data['store_location_indices_orig'] = store_location_indices 

        num_locs = len(locations)
        data['distance_matrix_physical_km'] = [[0.0] * num_locs for _ in range(num_locs)] # Ma trận mới
        # --- Use OpenRouteService for distance matrix ---
        try:
            logger.info("Attempting to get distance matrix from OpenRouteService...")
            ors_matrix_km = self._get_distance_matrix_ors(locations) # Giả sử hàm này trả về km
            logger.info(f"ORS matrix received (sample row 0): {ors_matrix_km[0][:5] if ors_matrix_km else 'Empty'}")
            
            # Điền vào cả ma trận physical và ma trận scaled
            data['distance_matrix_scaled'] = [[0] * num_locs for _ in range(num_locs)]
            for r in range(num_locs):
                for c in range(num_locs):
                    dist_km_val = float(ors_matrix_km[r][c])
                    data['distance_matrix_physical_km'][r][c] = dist_km_val
                    data['distance_matrix_scaled'][r][c] = int(dist_km_val * self.distance_cost_per_km)
            logger.info("Successfully processed ORS distance matrix.")
            print(ors_matrix_km)
        except Exception as e:
            logger.error(f"Falling back to Haversine due to ORS error: {e}")
            data['distance_matrix_scaled'] = [[0] * num_locs for _ in range(num_locs)]
            for i in range(num_locs):
                for j in range(i, num_locs):
                    # Sử dụng haversine trực tiếp từ thư viện
                    dist_km_val = haversine(locations[i], locations[j]) # locations[i] là (lat, lon)
                    
                    data['distance_matrix_physical_km'][i][j] = dist_km_val
                    data['distance_matrix_physical_km'][j][i] = dist_km_val # Đối xứng

                    scaled_dist = int(dist_km_val * self.distance_cost_per_km) if dist_km_val != float('inf') else 999999999
                    data['distance_matrix_scaled'][i][j] = scaled_dist
                    data['distance_matrix_scaled'][j][i] = scaled_dist
            logger.info("Successfully processed Haversine distance matrix (fallback).")

        data['scaled_item_prices_at_nodes'] = [
            int(price * self.item_price_scale_factor) for price in data['item_prices_at_nodes_original']
        ]

        max_scaled_dist = 0
        if data['distance_matrix_scaled'] and any(data['distance_matrix_scaled']): 
             max_scaled_dist = max(max(row) for row in data['distance_matrix_scaled'] if row)
        
        max_scaled_item_price = 0
        if data['scaled_item_prices_at_nodes']: 
            max_scaled_item_price = max(data['scaled_item_prices_at_nodes'])

        estimated_max_total_cost = (max_scaled_dist * data['num_nodes']) + \
                                   (max_scaled_item_price * len(req_groups_input))
        data['scaled_penalty'] = max(1000000, int(estimated_max_total_cost * 2) +1) 

        return data

    def _solve_with_or_tools(self, data_model): # Giữ nguyên
        if data_model is None:
            logger.error("Cannot solve, data_model is None.")
            return None, None, None

        try:
            manager = pywrapcp.RoutingIndexManager(data_model['num_nodes'], data_model['num_vehicles'], data_model['depot'])
            routing = pywrapcp.RoutingModel(manager)
        except Exception as e:
            logger.error(f"Error initializing OR-Tools manager/model: {e}. Num_nodes: {data_model.get('num_nodes')}")
            return None, None, None 

        def distance_callback(from_index, to_index):
            try:
                from_node = manager.IndexToNode(from_index)
                to_node = manager.IndexToNode(to_index)
                from_loc_idx = 0 if from_node == data_model['depot'] else data_model['node_to_store_map'].get(from_node)
                to_loc_idx = 0 if to_node == data_model['depot'] else data_model['node_to_store_map'].get(to_node)

                if from_loc_idx is None or to_loc_idx is None:
                    logger.error(f"Distance_callback: Unmapped node. From_node: {from_node} (loc:{from_loc_idx}), To_node: {to_node} (loc:{to_loc_idx})")
                    return data_model['scaled_penalty'] 
                return data_model['distance_matrix_scaled'][from_loc_idx][to_loc_idx]
            except Exception as e: 
                logger.error(f"Error in distance_callback ({from_index}->{to_index}): {e}")
                return data_model['scaled_penalty']


        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        def item_cost_callback(from_index):
            try:
                node_index = manager.IndexToNode(from_index)
                if 0 <= node_index < len(data_model['scaled_item_prices_at_nodes']):
                    return data_model['scaled_item_prices_at_nodes'][node_index]
                else:
                    logger.error(f"Item_cost_callback: Invalid node_index {node_index} for scaled_item_prices (len {len(data_model['scaled_item_prices_at_nodes'])}).")
                    return 0 
            except Exception as e:
                logger.error(f"Error in item_cost_callback (index {from_index}, node {manager.IndexToNode(from_index) if manager else 'N/A'}): {e}")
                return 0 

        item_cost_callback_idx = routing.RegisterUnaryTransitCallback(item_cost_callback)
        
        max_possible_scaled_item_cost_for_dim = sum(data_model['scaled_item_prices_at_nodes']) + data_model['scaled_penalty']
        vehicle_capacity_for_dim = [max(1, int(max_possible_scaled_item_cost_for_dim))] * data_model['num_vehicles']

        routing.AddDimension(
            item_cost_callback_idx,
            0, 
            vehicle_capacity_for_dim[0], 
            True, 
            'ItemCost'
        )
        item_cost_dimension = routing.GetDimensionOrDie('ItemCost')
        item_cost_dimension.SetGlobalSpanCostCoefficient(1) 

        for group_idx, or_tools_nodes_in_group in enumerate(data_model['task_nodes_for_group']):
            indices_in_group = [manager.NodeToIndex(node) for node in or_tools_nodes_in_group if node < data_model['num_nodes']] 
            
            if indices_in_group: 
                routing.AddDisjunction(
                    indices_in_group,
                    data_model['scaled_penalty'],
                    1 
                )
            elif data_model['req_groups_info_orig'][group_idx]: 
                 logger.warning(f"Group {group_idx+1} ({data_model['req_groups_info_orig'][group_idx]}) is required but has no valid task nodes after filtering.")

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
        search_parameters.time_limit.seconds = self.time_limit_seconds

        logger.info("Starting OR-Tools solver...")
        solution = routing.SolveWithParameters(search_parameters)
        logger.info(f"OR-Tools solver finished with status: {routing.status()}")
        return manager, routing, solution

    @staticmethod
    def _get_location_address_helper(location_idx, data_model):
        """Always use _reverse_geocode for user location (location_idx == 0)."""
        if location_idx == 0:
            user_loc = data_model['user_loc_info_orig']
            lat = user_loc.get('lat')
            lng = user_loc.get('lng')

            if lat is not None and lng is not None:
                try:
                    lat_f = float(lat)
                    lng_f = float(lng)
                    return SearchService._reverse_geocode(lat_f, lng_f)
                except Exception:
                    pass
            return "User Location"
        for store_id, loc_idx_val in data_model['store_location_indices_orig'].items():
            if loc_idx_val == location_idx:
                return data_model['stores_info_orig'][store_id].get('address', store_id)
        return f"Unknown Location (Index {location_idx})"

    @staticmethod
    def _get_coordinates_helper(location_idx, data_model):
        """Helper to get lat, lng for a location index."""
        if 0 <= location_idx < len(data_model['locations']):
            lat, lng = data_model['locations'][location_idx]
            return {'lat': lat, 'lng': lng}
        return {'lat': None, 'lng': None}

    def _parse_solution(self, data_model, manager, routing, solution):
        if not solution:
            # Trả về một list chứa một object lỗi 
            return [{
                'start': "N/A", 'end': "N/A", 'cost': 0, 'distance': 0, 'duration': 0,
                'coordinates': [], 'waypoints': [],
                '_error_message': f"OR-Tools solver did not find a solution. Status: {routing.status() if routing else 'UNKNOWN'}",
                '_solver_status_code': routing.status() if routing else -1
            }]

        detailed_node_map_orig_price = {} # Maps OR-Tools node index to its details
        or_tools_node_idx_tracker = 1
        for store_id, store_info in data_model['stores_info_orig'].items():
            store_loc_idx = data_model['store_location_indices_orig'].get(store_id)
            if store_loc_idx is None: continue

            for item_id, price in store_info.get('items', {}).items():
                try:
                    price_float = float(price)
                except (ValueError, TypeError): continue
                for group_set in data_model['req_groups_info_orig']:
                    if item_id in group_set:
                        detailed_node_map_orig_price[or_tools_node_idx_tracker] = {
                            'item_id': item_id, 'store_id': store_id,
                            'store_address': store_info.get('address', store_id),
                            'price_original': price_float, 'location_idx': store_loc_idx
                        }
                        or_tools_node_idx_tracker += 1
                        break
        
        trip_coordinates = []
        trip_waypoints_addresses = []
        trip_purchased_items = []
        total_trip_distance_km_to_last_store = 0 # Đổi tên để rõ ràng
        total_trip_duration_seconds_to_last_store = 0 # Đổi tên

        start_trip_location_idx = 0 
        start_trip_address = self._get_location_address_helper(start_trip_location_idx, data_model)
        start_trip_coords = self._get_coordinates_helper(start_trip_location_idx, data_model)
        
        trip_coordinates.append(start_trip_coords)
        trip_waypoints_addresses.append(start_trip_address)

        last_visited_physical_location_idx_for_waypoint = start_trip_location_idx # Chỉ để quản lý waypoints
        
        visited_or_tools_nodes_in_order = []
        temp_index = routing.Start(0)
        while not routing.IsEnd(temp_index):
            visited_or_tools_nodes_in_order.append(manager.IndexToNode(temp_index))
            temp_index = solution.Value(routing.NextVar(temp_index))
        # KHÔNG thêm điểm cuối (depot) vào đây nếu không muốn tính chặng về
        # visited_or_tools_nodes_in_order.append(manager.IndexToNode(temp_index)) # Dòng này có thể bỏ nếu không muốn xử lý chặng cuối cùng trong vòng lặp


        last_store_physical_loc_idx = -1 # Sẽ lưu location_idx của cửa hàng cuối cùng ghé
        last_store_address = start_trip_address # Mặc định nếu không ghé cửa hàng nào
        last_store_item_purchase_node = -1 # OR-Tools node của task mua hàng cuối cùng


        # Lặp qua các CHẶNG ĐƯỜNG (arcs) của lộ trình
        # Nếu không muốn tính chặng cuối về depot, chỉ lặp đến trước chặng cuối
        # num_arcs_to_consider = len(visited_or_tools_nodes_in_order) - 1
        
        # Xây dựng lại lộ trình từ solution để lấy các task thực sự
        # Solution chứa một chuỗi các OR-Tools Node Indices
        current_or_tools_idx = routing.Start(0)
        route_nodes_from_solution = []
        while not routing.IsEnd(current_or_tools_idx):
            route_nodes_from_solution.append(manager.IndexToNode(current_or_tools_idx))
            current_or_tools_idx = solution.Value(routing.NextVar(current_or_tools_idx))
        # Thêm node cuối cùng (thường là depot)
        route_nodes_from_solution.append(manager.IndexToNode(current_or_tools_idx))

        logger.info(f"DEBUG: Full route nodes from OR-Tools solution: {route_nodes_from_solution}")

        # Bây giờ lặp qua các CUNG ĐƯỜNG (legs) của lộ trình này
        for i in range(len(route_nodes_from_solution) - 1):
            from_or_tools_node_in_path = route_nodes_from_solution[i]
            to_or_tools_node_in_path = route_nodes_from_solution[i+1] # Node tiếp theo trong lộ trình
            
            # Nếu chặng này là từ cửa hàng cuối cùng về depot, thì không tính vào distance/duration
            # Điều này xảy ra khi from_node là một task node, và to_node là depot VÀ nó là điểm cuối của route.
            # Cách kiểm tra đơn giản hơn: nếu to_node là depot VÀ nó là node cuối cùng trong route_nodes_from_solution
            # thì chặng này (i) là chặng về.
            
            is_last_leg_to_depot = False
            if to_or_tools_node_in_path == data_model['depot'] and i == len(route_nodes_from_solution) - 2:
                is_last_leg_to_depot = True
                logger.info(f"DEBUG: Identified last leg to depot: from {from_or_tools_node_in_path} to {to_or_tools_node_in_path}. Skipping distance/duration for this leg.")


            leg_distance_km = 0.0
            if not is_last_leg_to_depot: # Chỉ tính khoảng cách nếu không phải chặng cuối về nhà
                from_loc_idx = 0 if from_or_tools_node_in_path == data_model['depot'] else data_model['node_to_store_map'].get(from_or_tools_node_in_path)
                to_loc_idx = 0 if to_or_tools_node_in_path == data_model['depot'] else data_model['node_to_store_map'].get(to_or_tools_node_in_path)

                if from_loc_idx is not None and to_loc_idx is not None:
                    leg_distance_km = data_model['distance_matrix_physical_km'][from_loc_idx][to_loc_idx]
                    total_trip_distance_km_to_last_store += leg_distance_km
                else:
                    logger.warning(f"Could not map nodes to loc_idx for leg: {from_or_tools_node_in_path} -> {to_or_tools_node_in_path}")
            
            # Duration vẫn tính từ leg_distance_km (sẽ là 0 nếu is_last_leg_to_depot)
            leg_duration_hours = leg_distance_km / self.average_speed_kmh if self.average_speed_kmh > 0 else 0
            leg_duration_seconds = int(leg_duration_hours * 3600)
            if not is_last_leg_to_depot:
                total_trip_duration_seconds_to_last_store += leg_duration_seconds

            # Xử lý việc mua hàng và waypoints (logic này vẫn giữ nguyên)
            if to_or_tools_node_in_path != data_model['depot']: # Đây là một task node (cửa hàng)
                task_detail = detailed_node_map_orig_price.get(to_or_tools_node_in_path)
                if task_detail:
                    trip_purchased_items.append({
                        "item_id": task_detail['item_id'],
                        "store_id": task_detail['store_id'],
                        "price_original": task_detail['price_original']
                    })
                    
                    current_physical_loc_idx = task_detail['location_idx']
                    # Cập nhật thông tin cửa hàng cuối cùng
                    last_store_physical_loc_idx = current_physical_loc_idx
                    last_store_address = self._get_location_address_helper(current_physical_loc_idx, data_model)
                    last_store_item_purchase_node = to_or_tools_node_in_path


                    if current_physical_loc_idx != last_visited_physical_location_idx_for_waypoint:
                        trip_coordinates.append(self._get_coordinates_helper(current_physical_loc_idx, data_model))
                        trip_waypoints_addresses.append(self._get_location_address_helper(current_physical_loc_idx, data_model))
                        last_visited_physical_location_idx_for_waypoint = current_physical_loc_idx
            # Không cần xử lý đặc biệt cho to_node là depot cuối cùng ở đây nữa vì đã check is_last_leg_to_depot

        total_trip_items_cost_original = sum(item['price_original'] for item in trip_purchased_items)
        
        # End address giờ sẽ là địa chỉ của cửa hàng cuối cùng đã ghé
        # Hoặc nếu không ghé cửa hàng nào, nó sẽ là địa chỉ bắt đầu
        end_trip_address = last_store_address if last_store_physical_loc_idx != -1 else start_trip_address
        if not trip_purchased_items: # Nếu không mua gì cả, điểm kết thúc là điểm bắt đầu
             end_trip_address = start_trip_address
             # Trong trường hợp này, trip_coordinates và trip_waypoints_addresses chỉ chứa điểm bắt đầu
             # total_trip_distance_km_to_last_store và duration sẽ là 0.


        final_trip_object = {
            'start': start_trip_address,
            'end': end_trip_address, # Địa chỉ của cửa hàng cuối cùng
            'cost': round(total_trip_items_cost_original, 2),
            'distance': round(total_trip_distance_km_to_last_store, 2), # Khoảng cách đến cửa hàng cuối
            'duration': int(total_trip_duration_seconds_to_last_store/60), # Thời gian đến cửa hàng cuối
            'coordinates': trip_coordinates, # Vẫn bao gồm tất cả các điểm đã ghé
            'waypoints': trip_waypoints_addresses, # Vẫn bao gồm tất cả các điểm đã ghé
            '_solver_objective_scaled': solution.ObjectiveValue(), 
            '_coverage_check': {}, 
            '_purchased_items_details': trip_purchased_items
        }

        
        # --- Coverage Check  ---
        covered_groups_flags = [False] * len(data_model['req_groups_info_orig'])
        for item_info in trip_purchased_items:
            for i, group_set in enumerate(data_model['req_groups_info_orig']):
                if item_info['item_id'] in group_set:
                    covered_groups_flags[i] = True
                    break
        
        for i, group_set in enumerate(data_model['req_groups_info_orig']):
            group_key_name = "_".join(sorted(list(group_set))[:2]) if group_set else f"empty_group_{i+1}"
            if not group_key_name: group_key_name = f"group_{i+1}"
            final_trip_object['_coverage_check'][f"group_{group_key_name}"] = "COVERED" if covered_groups_flags[i] else "NOT_COVERED"

        # The result is a list containing this single trip object
        return [final_trip_object]

    def find_optimal_shopping_plan(self, stores_for_search, required_item_groups, user_loc):
        self.logger.info("Received request for optimal shopping plan (single trip output).")
        if not stores_for_search or not required_item_groups or not user_loc:
            self.logger.error("Missing required input: stores, groups, or user_loc.")
            return [{
                'start': "N/A", 'end': "N/A", 'cost': 0, 'distance': 0, 'duration': 0,
                'coordinates': [], 'waypoints': [],
                '_error_message': "Missing stores, groups, or user location.",
            }]
        self.logger.info("Preparing data model...")
        data_model = self._prepare_data_model(stores_for_search, user_loc, required_item_groups)
        if data_model is None:
            self.logger.error("Failed to prepare data model.")
            return [{
                'start': "N/A", 'end': "N/A", 'cost': 0, 'distance': 0, 'duration': 0,
                'coordinates': [], 'waypoints': [],
                '_error_message': "Error preparing data for OR-Tools."
            }]
        for i, task_nodes in enumerate(data_model['task_nodes_for_group']):
            group_set = required_item_groups[i]
            if not task_nodes and group_set:
                group_name_preview = "_".join(sorted(list(group_set))[:2])
                msg = f"No items available for a required group: ({group_name_preview}...). Cannot find a valid plan."
                self.logger.error(msg)
                return [{
                    'start': "N/A", 'end': "N/A", 'cost': 0, 'distance': 0, 'duration': 0,
                    'coordinates': [], 'waypoints': [],
                    '_error_message': msg,
                    '_status_code': "INFEASIBLE_REQUIREMENTS"
                }]
        self.logger.info(f"Data model prepared. Num_nodes: {data_model['num_nodes']}, Num_locations: {len(data_model['locations'])}")
        manager, routing, solution = self._solve_with_or_tools(data_model)
        if not solution:
            status_map = {0: "ROUTING_NOT_SOLVED", 1: "ROUTING_SUCCESS", 2: "ROUTING_FAIL",
                          3: "ROUTING_FAIL_TIMEOUT", 4: "ROUTING_INVALID"}
            solver_status_str = status_map.get(routing.status() if routing else -1, 'UNKNOWN_SOLVER_STATE')
            self.logger.warning(f"No solution found by OR-Tools. Solver status: {solver_status_str}")
            return [{
                'start': "N/A", 'end': "N/A", 'cost': 0, 'distance': 0, 'duration': 0,
                'coordinates': [], 'waypoints': [],
                '_error_message': f"Solver did not find a solution. Status: {solver_status_str}",
                '_solver_status_code': routing.status() if routing else -1
            }]
        self.logger.info("Solution found. Parsing results for single trip output...")
        parsed_plan = self._parse_solution(data_model, manager, routing, solution)
        self.logger.info("Optimal shopping plan (single trip) processed successfully.")
        return parsed_plan

    def get_plans_from_nearby(
        self,
        stores_list: List[dict],  
        user_loc_tuple: Tuple[float, float] 
    ) -> List[dict]:
        if not stores_list:
            logger.warning("get_plans_from_nearby: Empty stores_list provided.")
            return []

        original_product_groups_structure = [] # Lưu lại cấu trúc product_name và candidates ban đầu
        if stores_list:
            for item_info_template in stores_list[0].get("items", []):
                product_name_needed = item_info_template.get("product_name")
                if product_name_needed:
                    original_product_groups_structure.append({
                        "product_name": product_name_needed,
                        "candidates_names": set() # Sẽ thu thập tất cả candidate names cho product_name này
                    })
        
        if not original_product_groups_structure:
            logger.warning("get_plans_from_nearby: Could not determine required product groups from stores_list.")
            return []

        # --- Xây dựng stores_for_search và thu thập tất cả candidate names cho mỗi product_name ---
        stores_for_search = {}
        all_candidates_for_product_name_map: Dict[str, Set[str]] = {
            pg['product_name']: set() for pg in original_product_groups_structure
        }

        for store_data_from_input in stores_list:
            store_address = store_data_from_input.get("address")
            if not store_address:
                logger.warning(f"Skipping store due to missing address (used as key): {store_data_from_input}")
                continue
            
            store_key = store_address 
            lat = store_data_from_input.get("lat")
            lng = store_data_from_input.get("lng")

            if lat is None or lng is None:
                logger.warning(f"Skipping store {store_key} due to missing lat/lng.")
                continue
            
            current_store_items_for_search = {}
            has_at_least_one_valid_item_for_needed_groups = False

            # Duyệt qua các product_group mà người dùng CẦN (từ original_product_groups_structure)
            for needed_pg_info in original_product_groups_structure:
                needed_product_name = needed_pg_info["product_name"]
                
                # Tìm product_group tương ứng trong cửa hàng hiện tại
                store_pg_data = next((item_grp for item_grp in store_data_from_input.get("items", [])
                                      if item_grp.get("product_name") == needed_product_name), None)
                
                if store_pg_data and store_pg_data.get("candidates"):
                    qty = store_pg_data.get("quantity", 1)
                    for candidate in store_pg_data.get("candidates", []):
                        candidate_name = candidate.get("name")
                        candidate_price = candidate.get("price", 0) or 0
                        if candidate_name:
                            current_store_items_for_search[candidate_name] = candidate_price * qty
                            all_candidates_for_product_name_map[needed_product_name].add(candidate_name)
                            has_at_least_one_valid_item_for_needed_groups = True
            
            if has_at_least_one_valid_item_for_needed_groups and current_store_items_for_search:
                 stores_for_search[store_key] = {
                    "lat": lat,
                    "lng": lng,
                    "items": current_store_items_for_search
                }
            else:
                logger.info(f"Store {store_key} does not offer any items for the required product groups or has no items. Skipping.")


        if not stores_for_search:
            logger.warning("get_plans_from_nearby: No stores left after filtering and processing for required items.")
            return []

        # --- Xây dựng required_item_groups từ all_candidates_for_product_name_map ---
        required_item_groups = []
        for needed_pg_info in original_product_groups_structure:
            product_name = needed_pg_info["product_name"]
            candidate_set_for_this_product = all_candidates_for_product_name_map.get(product_name)
            if candidate_set_for_this_product: # Chỉ thêm group nếu có ít nhất 1 candidate cho product_name đó
                required_item_groups.append(candidate_set_for_this_product)
            else:
                # Điều này có nghĩa là không có cửa hàng nào cung cấp BẤT KỲ candidate nào cho product_name này
                logger.error(f"CRITICAL: No candidates found across ALL processed stores for required product_name: '{product_name}'. Plan will be infeasible.")
                # Bạn có thể muốn trả về lỗi ở đây ngay lập tức
                return [{
                    '_error_message': f"No items available anywhere for the product group: '{product_name}'.",
                    # ... (các trường lỗi khác)
                }]


        user_loc_for_solver = {"lat": user_loc_tuple[0], "lng": user_loc_tuple[1]}
        
        logger.debug("--- Prepared for find_optimal_shopping_plan ---")
        logger.debug(f"stores_for_search: {stores_for_search}")
        logger.debug(f"required_item_groups: {required_item_groups}")
        logger.debug(f"user_loc_for_solver: {user_loc_for_solver}")
        logger.debug("-------------------------------------------------")


        # --- Gọi find_optimal_shopping_plan nhiều lần với distance_cost_per_km khác nhau ---
        results = []
        distance_costs_to_try = [0, 500, 500000] # Các giá trị bạn muốn thử

        for i, cost_per_km in enumerate(distance_costs_to_try):
            self.distance_cost_per_km = cost_per_km # Cập nhật cho instance
            logger.info(f"\n--- Finding plan with DISTANCE_COST_PER_KM = {self.distance_cost_per_km} ---")
            plan = self.find_optimal_shopping_plan(
                stores_for_search=stores_for_search,
                required_item_groups=required_item_groups,
                user_loc=user_loc_for_solver
            )
            for p in plan:
                p['id'] = i
            results.extend(plan) 

        return results
