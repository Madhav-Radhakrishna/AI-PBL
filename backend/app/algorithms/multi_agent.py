from typing import Dict, List
from app.algorithms.search import DisasterSearchEngine

class MultiAgentPlanner:
    """
    Multi-Agent Evacuation & Emergency Vehicle Planner.
    Agents: Civilian, Ambulance, Fire Truck, Rescue Team, Police.

    Unit IV: Multi-Agent Planning & Preference Optimization.
    """
    def __init__(self, nodes: Dict[str, dict], roads: List[dict]):
        self.nodes = nodes
        self.roads = roads

        # Weight profiles per agent role
        self.agent_profiles = {
            "CIVILIAN": {
                "name": "Civilian Evacuation Convoy",
                "priority": "Safety Priority",
                "weights": {
                    "w_distance": 0.15,
                    "w_travel_time": 0.15,
                    "w_hazard_risk": 0.50,
                    "w_traffic": 0.10,
                    "w_future_risk": 0.10
                },
                "color": "#10b981" # Green
            },
            "AMBULANCE": {
                "name": "Emergency Ambulance",
                "priority": "Travel-Time Priority",
                "weights": {
                    "w_distance": 0.20,
                    "w_travel_time": 0.60,
                    "w_hazard_risk": 0.10,
                    "w_traffic": 0.05,
                    "w_future_risk": 0.05
                },
                "color": "#ef4444" # Red
            },
            "FIRE_TRUCK": {
                "name": "Fire & Rescue Truck",
                "priority": "Accessibility & Water Line Priority",
                "weights": {
                    "w_distance": 0.30,
                    "w_travel_time": 0.20,
                    "w_hazard_risk": 0.20,
                    "w_traffic": 0.20,
                    "w_future_risk": 0.10
                },
                "color": "#f97316" # Orange
            },
            "RESCUE_TEAM": {
                "name": "Disaster Rescue Team",
                "priority": "Hazard Proximity & Mission Priority",
                "weights": {
                    "w_distance": 0.20,
                    "w_travel_time": 0.30,
                    "w_hazard_risk": 0.30,
                    "w_traffic": 0.10,
                    "w_future_risk": 0.10
                },
                "color": "#3b82f6" # Blue
            },
            "POLICE": {
                "name": "Traffic Police Escort",
                "priority": "Congestion Clearance Priority",
                "weights": {
                    "w_distance": 0.20,
                    "w_travel_time": 0.20,
                    "w_hazard_risk": 0.20,
                    "w_traffic": 0.35,
                    "w_future_risk": 0.05
                },
                "color": "#8b5cf6" # Purple
            }
        }

    def plan_multi_agent_routes(self, agent_requests: List[dict]) -> List[dict]:
        """
        agent_requests: list of dicts:
        [
          {"agent_id": "A1", "role": "AMBULANCE", "start_node": "ZONE_AMEERPET", "target_node": "SHELTER_BEGUMPET"},
          {"agent_id": "A2", "role": "FIRE_TRUCK", "start_node": "ZONE_KHAIRATABAD", "target_node": "SHELTER_LAKDIKAPUL"}
        ]
        """
        planned_routes = []
        claimed_edges_count = {} # Edge usage counting for deconfliction

        for req in agent_requests:
            role = req.get("role", "CIVILIAN")
            profile = self.agent_profiles.get(role, self.agent_profiles["CIVILIAN"])
            start_node = req["start_node"]
            target_node = req["target_node"]

            # Adjust road weights for edge deconfliction if heavily used by other agents
            adjusted_roads = []
            for r in self.roads:
                r_copy = r.copy()
                usage = claimed_edges_count.get(r["id"], 0)
                if usage > 0:
                    r_copy["traffic_density"] = min(r_copy.get("traffic_density", 20) + usage * 25.0, 100.0)
                adjusted_roads.append(r_copy)

            search_engine = DisasterSearchEngine(self.nodes, adjusted_roads, weights=profile["weights"])
            res = search_engine.a_star(start_node, target_node)

            if res["found"]:
                for e in res["path_edges"]:
                    eid = e["id"]
                    claimed_edges_count[eid] = claimed_edges_count.get(eid, 0) + 1

            planned_routes.append({
                "agent_id": req.get("agent_id", "AGENT_1"),
                "role": role,
                "agent_name": profile["name"],
                "priority_description": profile["priority"],
                "color": profile["color"],
                "start_node": start_node,
                "target_node": target_node,
                "found": res["found"],
                "path": res["path"],
                "path_edges": res["path_edges"],
                "cost": res["cost"],
                "eta_min": round(res["cost"] * 2.0, 1),
                "overall_risk": res["overall_risk"]
            })

        return planned_routes
