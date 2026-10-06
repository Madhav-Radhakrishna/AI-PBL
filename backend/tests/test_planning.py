import pytest
from app.algorithms.planning import EvacuationPlanner
from app.seed_data import HYDERABAD_NODES

def test_evacuation_planner_execution():
    disaster_data = {"type": "Flood", "severity": 8.0}
    zones = [{"id": "ZONE_AMEERPET", "name": "Ameerpet", "population": 4000}]
    shelters = [{"id": "SHELTER_BEGUMPET", "name": "Begumpet Shelter", "capacity": 5000, "current_occupancy": 500, "risk_level": "LOW"}]
    roads = [
        {"id": "R1", "u": "ZONE_AMEERPET", "v": "SHELTER_BEGUMPET", "distance_km": 2.0, "is_blocked": False, "water_level_cm": 10.0, "traffic_density": 20.0, "elevation_meters": 500.0, "hazard_proximity_km": 3.0}
    ]
    weather = {"rainfall_mm_hr": 50.0, "wind_speed_kmh": 20.0}

    planner = EvacuationPlanner(disaster_data, zones, shelters, roads, HYDERABAD_NODES)
    plan = planner.generate_full_plan(weather)

    assert "plan_steps" in plan
    assert len(plan["plan_steps"]) == 5
    assert plan["csp_shelter_assignment"]["solved"] is True
    assert len(plan["zone_routes"]) == 1
