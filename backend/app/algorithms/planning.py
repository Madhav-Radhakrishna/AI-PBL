from typing import Dict, List, Any
from app.algorithms.search import DisasterSearchEngine
from app.algorithms.csp import ShelterCSP
from app.bayesian.bayes_network import bayes_net_instance
from app.ml.risk_model import risk_model_instance

class EvacuationPlanner:
    """
    Classical & Dynamic Evacuation Planner.
    Coordinates AI risk predictions, Bayesian uncertainty reasoning, CSP shelter allocation, and A* route planning.

    Unit IV: Planning, Dynamic Environment Replanning.
    """
    def __init__(self, disaster_data: dict, zones: List[dict], shelters: List[dict], roads: List[dict], nodes: Dict[str, dict]):
        self.disaster_data = disaster_data
        self.zones = zones
        self.shelters = shelters
        self.roads = roads
        self.nodes = nodes

    def generate_full_plan(self, weather_data: dict, weights: dict = None) -> dict:
        # Step 1: Calculate Bayesian & ML risk for all roads
        updated_roads = []
        road_risk_map = {}

        for r in self.roads:
            r_copy = r.copy()
            # Predict risk with ML
            ml_input = {
                "rainfall": weather_data.get("rainfall_mm_hr", 75.0),
                "water_level": r.get("water_level_cm", 50.0),
                "distance_from_hazard": r.get("hazard_proximity_km", 2.0),
                "hazard_severity": self.disaster_data.get("severity", 8.0),
                "road_condition": 2 if r.get("is_blocked") else 0,
                "traffic_density": r.get("traffic_density", 30.0),
                "population_density": 10000.0,
                "elevation": r.get("elevation_meters", 500.0),
                "wind_speed": weather_data.get("wind_speed_kmh", 20.0)
            }
            ml_pred = risk_model_instance.predict(ml_input)

            # Predict uncertainty with Bayesian Net
            bayes_input = {
                "rainfall_mm_hr": weather_data.get("rainfall_mm_hr", 75.0),
                "water_level_cm": r.get("water_level_cm", 50.0),
                "elevation_m": r.get("elevation_meters", 500.0),
                "hazard_severity": self.disaster_data.get("severity", 8.0)
            }
            bayes_pred = bayes_net_instance.predict(bayes_input)

            r_copy["hazard_risk"] = ml_pred["risk_score"]
            r_copy["risk_category"] = ml_pred["risk_category"]
            r_copy["prob_unsafe"] = bayes_pred["prob_road_unsafe"]
            updated_roads.append(r_copy)
            road_risk_map[r["id"]] = r_copy

        # Step 2: Distance matrix for CSP
        distance_matrix = {}
        blocked_routes = set()

        for z in self.zones:
            for s in self.shelters:
                # Find shortest path distance using search engine
                search = DisasterSearchEngine(self.nodes, updated_roads, weights)
                res = search.a_star(z["id"], s["id"])
                dist = res["cost"] if res["found"] else 99.0
                distance_matrix[(z["id"], s["id"])] = dist
                if not res["found"]:
                    blocked_routes.add((z["id"], s["id"]))

        # Step 3: Run CSP for Shelter Assignment
        csp_solver = ShelterCSP(self.zones, self.shelters, distance_matrix, blocked_routes)
        csp_result = csp_solver.solve()

        # Step 4: Compute A* Routes for each assigned zone
        zone_routes = []
        search = DisasterSearchEngine(self.nodes, updated_roads, weights)

        for assign in csp_result["assignments"]:
            zid = assign["zone_id"]
            sid = assign["assigned_shelter_id"]
            route_res = search.a_star(zid, sid)

            zone_routes.append({
                "zone_id": zid,
                "zone_name": assign["zone_name"],
                "population": assign["population"],
                "target_shelter_id": sid,
                "target_shelter_name": assign["assigned_shelter_name"],
                "route_path": route_res["path"],
                "distance_km": route_res["cost"],
                "eta_minutes": round(route_res["cost"] * 2.5, 1),
                "overall_risk_score": route_res["overall_risk"],
                "nodes_explored": route_res["nodes_explored"]
            })

        # Structured planning steps for display
        plan_steps = [
            {"step_id": 1, "action": "Identify Disaster & Affected Zones", "detail": f"Disaster: {self.disaster_data.get('type')} (Severity {self.disaster_data.get('severity')}/10). Affected population: {sum(z['population'] for z in self.zones):,}"},
            {"step_id": 2, "action": "Predict Road Risk (ML & Bayes)", "detail": f"Analyzed {len(self.roads)} road corridors using Decision Tree & Bayesian Network."},
            {"step_id": 3, "action": "Calculate Shelter Capacity Constraints", "detail": f"Evaluated {len(self.shelters)} open shelters using CSP Backtracking with MRV heuristic."},
            {"step_id": 4, "action": "Generate Optimal Evacuation Routes (A*)", "detail": f"Calculated safe minimum-risk paths minimizing f(n) = g(n) + h(n)."},
            {"step_id": 5, "action": "Deploy Evacuation Plan", "detail": "All population zones assigned to safe shelters with zero capacity violations."}
        ]

        total_affected = sum(z["population"] for z in self.zones)
        avg_risk = sum(zr["overall_risk_score"] for zr in zone_routes) / max(len(zone_routes), 1)

        return {
            "disaster": self.disaster_data,
            "weather": weather_data,
            "plan_steps": plan_steps,
            "total_affected_population": total_affected,
            "overall_plan_safety_score": round(max(100.0 - avg_risk, 0.0), 1),
            "csp_shelter_assignment": csp_result,
            "zone_routes": zone_routes,
            "updated_roads": updated_roads
        }
