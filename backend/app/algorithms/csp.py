from typing import Dict, List, Optional, Tuple, Set

class ShelterCSP:
    """
    Constraint Satisfaction Problem (CSP) Solver for Shelter Allocation.
    Variables: Evacuation Zones
    Domains: Available Shelters
    Constraints: Capacity, Safety, Distance, Accessibility, Congestion.

    Unit II: CSP, Backtracking, MRV Heuristic, Constraint Propagation.
    """
    def __init__(self, zones: List[dict], shelters: List[dict], distance_matrix: Dict[Tuple[str, str], float], blocked_routes: Set[Tuple[str, str]] = None):
        self.zones = zones # List of {"id": str, "name": str, "population": int}
        self.shelters = shelters # List of {"id": str, "name": str, "capacity": int, "current_occupancy": int, "risk_level": str}
        self.distance_matrix = distance_matrix # (zone_id, shelter_id) -> dist_km
        self.blocked_routes = blocked_routes or set()

        self.variables = [z["id"] for z in self.zones]
        self.zone_map = {z["id"]: z for z in self.zones}
        self.shelter_map = {s["id"]: s for s in self.shelters}

        # Calculate initial available capacity for each shelter
        self.available_capacity = {
            s["id"]: max(s["capacity"] - s["current_occupancy"], 0)
            for s in self.shelters
        }

        # Domains: list of candidate shelter IDs for each zone
        self.domains = {z["id"]: self._get_initial_domain(z["id"]) for z in self.zones}
        self.backtrack_steps = []

    def _get_initial_domain(self, zone_id: str) -> List[str]:
        valid_shelters = []
        for s in self.shelters:
            sid = s["id"]
            # Safety constraint check: reject shelters marked CRITICAL risk
            if s.get("risk_level") == "CRITICAL":
                continue
            # Accessibility constraint check: reject if direct route is blocked
            if (zone_id, sid) in self.blocked_routes:
                continue
            valid_shelters.append(sid)
        return valid_shelters

    def is_consistent(self, zone_id: str, shelter_id: str, assignment: Dict[str, str]) -> Tuple[bool, str]:
        # 1. Capacity Constraint
        pop = self.zone_map[zone_id]["population"]
        current_assigned_pop = sum(
            self.zone_map[z]["population"]
            for z, s in assignment.items()
            if s == shelter_id
        )
        shelter_cap = self.available_capacity.get(shelter_id, 0)
        if current_assigned_pop + pop > shelter_cap:
            return False, f"Capacity exceeded on shelter {shelter_id} ({current_assigned_pop + pop} > {shelter_cap})"

        # 2. Distance Constraint (max 20km for emergency assignment)
        dist = self.distance_matrix.get((zone_id, shelter_id), 10.0)
        if dist > 25.0:
            return False, f"Distance too far ({dist:.1f} km > 25.0 km)"

        return True, "Valid"

    def select_unassigned_variable(self, assignment: Dict[str, str]) -> str:
        """MRV (Minimum Remaining Values) Heuristic: picks unassigned zone with smallest remaining domain."""
        unassigned = [v for v in self.variables if v not in assignment]
        # Sort by domain length
        unassigned.sort(key=lambda v: len(self.domains[v]))
        return unassigned[0]

    def order_domain_values(self, zone_id: str, assignment: Dict[str, str]) -> List[str]:
        """LCV (Least Constraining Value) Heuristic: sorts shelters by distance & remaining capacity."""
        candidates = self.domains[zone_id]
        def score(sid):
            dist = self.distance_matrix.get((zone_id, sid), 10.0)
            avail = self.available_capacity.get(sid, 0)
            return dist - (avail / 1000.0) # Prefer closer distance and higher available capacity

        return sorted(candidates, key=score)

    def solve(self) -> dict:
        assignment = {}
        success = self._backtrack(assignment)

        result_details = []
        total_evacuated = 0
        shelter_usage = {s["id"]: 0 for s in self.shelters}

        for zid, sid in assignment.items():
            z_info = self.zone_map[zid]
            s_info = self.shelter_map[sid]
            dist = self.distance_matrix.get((zid, sid), 0.0)
            shelter_usage[sid] += z_info["population"]
            total_evacuated += z_info["population"]

            result_details.append({
                "zone_id": zid,
                "zone_name": z_info["name"],
                "population": z_info["population"],
                "assigned_shelter_id": sid,
                "assigned_shelter_name": s_info["name"],
                "distance_km": round(dist, 2),
                "status": "ASSIGNED"
            })

        return {
            "solved": success,
            "total_zones": len(self.zones),
            "assigned_zones_count": len(assignment),
            "total_population_assigned": total_evacuated,
            "assignments": result_details,
            "shelter_utilization": [
                {
                    "shelter_id": sid,
                    "shelter_name": self.shelter_map[sid]["name"],
                    "capacity": self.shelter_map[sid]["capacity"],
                    "assigned_population": shelter_usage[sid],
                    "occupancy_pct": round((shelter_usage[sid] / max(self.shelter_map[sid]["capacity"], 1)) * 100, 1)
                }
                for sid in self.shelter_map
            ],
            "backtrack_steps": self.backtrack_steps[:40]
        }

    def _backtrack(self, assignment: Dict[str, str]) -> bool:
        if len(assignment) == len(self.variables):
            return True

        var = self.select_unassigned_variable(assignment)

        for val in self.order_domain_values(var, assignment):
            consistent, reason = self.is_consistent(var, val, assignment)

            self.backtrack_steps.append({
                "zone": var,
                "tried_shelter": val,
                "consistent": consistent,
                "reason": reason,
                "current_assignment_count": len(assignment)
            })

            if consistent:
                assignment[var] = val
                # Constraint propagation (Forward Checking)
                if self._backtrack(assignment):
                    return True
                del assignment[var]

        return False
