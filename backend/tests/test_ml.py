import pytest
from app.ml.risk_model import risk_model_instance
from app.ml.traffic_model import traffic_model_instance

def test_risk_ml_model_prediction():
    input_data = {
        "rainfall": 78.0,
        "water_level": 82.0,
        "distance_from_hazard": 0.7,
        "hazard_severity": 8.0,
        "road_condition": 2,
        "traffic_density": 71.0,
        "population_density": 12000.0,
        "elevation": 490.0,
        "wind_speed": 40.0
    }

    res = risk_model_instance.predict(input_data)
    assert "risk_score" in res
    assert 0 <= res["risk_score"] <= 100
    assert res["risk_category"] in ["SAFE", "MODERATE", "HIGH RISK", "CRITICAL"]
    assert res["confidence"] > 0.0

def test_decision_tree_structure():
    tree = risk_model_instance.get_tree_structure()
    assert "name" in tree
    assert "children" in tree or "category" in tree

def test_traffic_prediction_model():
    res = traffic_model_instance.predict({"current_traffic": 40.0, "road_capacity": 2000, "population_density": 5000, "evacuation_demand": 1000, "disaster_severity": 7.0})
    assert "predicted_congestion_pct" in res
    assert res["predicted_travel_time_min"] >= res["base_travel_time_min"]
