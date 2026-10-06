import pytest
from app.algorithms.search import DisasterSearchEngine, compute_euclidean_distance

def test_euclidean_distance():
    # Hyderabad Begumpet to Ameerpet (~2.2 km)
    dist = compute_euclidean_distance(17.444, 78.466, 17.437, 78.448)
    assert 1.5 < dist < 3.0

def test_search_algorithms_on_simple_graph():
    nodes = {
        "A": {"id": "A", "lat": 17.4, "lng": 78.4},
        "B": {"id": "B", "lat": 17.41, "lng": 78.41},
        "C": {"id": "C", "lat": 17.42, "lng": 78.42},
        "D": {"id": "D", "lat": 17.43, "lng": 78.43}
    }
    edges = [
        {"id": "e1", "u": "A", "v": "B", "distance_km": 2.0, "travel_time_min": 5.0, "hazard_risk": 10.0, "traffic_density": 20.0, "is_blocked": False},
        {"id": "e2", "u": "B", "v": "C", "distance_km": 2.0, "travel_time_min": 5.0, "hazard_risk": 20.0, "traffic_density": 20.0, "is_blocked": False},
        {"id": "e3", "u": "C", "v": "D", "distance_km": 2.0, "travel_time_min": 5.0, "hazard_risk": 10.0, "traffic_density": 20.0, "is_blocked": False},
        {"id": "e4", "u": "A", "v": "D", "distance_km": 10.0, "travel_time_min": 30.0, "hazard_risk": 90.0, "traffic_density": 90.0, "is_blocked": False}
    ]

    engine = DisasterSearchEngine(nodes, edges)

    # Test BFS
    res_bfs = engine.bfs("A", "D")
    assert res_bfs["found"] is True
    assert res_bfs["nodes_explored"] >= 2

    # Test UCS
    res_ucs = engine.ucs("A", "D")
    assert res_ucs["found"] is True
    assert res_ucs["path"] == ["A", "B", "C", "D"] # Should avoid high-risk edge e4

    # Test Greedy Best First
    res_greedy = engine.greedy_best_first("A", "D")
    assert res_greedy["found"] is True

    # Test A*
    res_astar = engine.a_star("A", "D")
    assert res_astar["found"] is True
    assert res_astar["path"] == ["A", "B", "C", "D"]
    assert res_astar["cost"] > 0
