import pytest
from app.algorithms.csp import ShelterCSP

def test_csp_shelter_allocation():
    zones = [
        {"id": "Z1", "name": "Zone 1", "population": 2000},
        {"id": "Z2", "name": "Zone 2", "population": 3000}
    ]
    shelters = [
        {"id": "S1", "name": "Shelter 1", "capacity": 6000, "current_occupancy": 0, "risk_level": "LOW"},
        {"id": "S2", "name": "Shelter 2", "capacity": 2000, "current_occupancy": 0, "risk_level": "LOW"}
    ]
    dist_matrix = {
        ("Z1", "S1"): 2.0, ("Z1", "S2"): 5.0,
        ("Z2", "S1"): 3.0, ("Z2", "S2"): 1.0
    }

    solver = ShelterCSP(zones, shelters, dist_matrix)
    res = solver.solve()
    assert res["solved"] is True
    assert len(res["assignments"]) == 2
    # Verify capacity not exceeded
    for util in res["shelter_utilization"]:
        assert util["assigned_population"] <= util["capacity"]
