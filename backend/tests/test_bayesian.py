import pytest
from app.bayesian.bayes_network import bayes_net_instance

def test_bayesian_inference_high_risk():
    evidence = {
        "rainfall_mm_hr": 85.0,
        "water_level_cm": 90.0,
        "elevation_m": 480.0,
        "hazard_severity": 9.0
    }
    res = bayes_net_instance.predict(evidence)
    assert res["prob_flooding"] > 0.70
    assert res["prob_road_unsafe"] > 0.70
    assert res["prob_road_safe"] < 0.30
    assert len(res["evidence_contributions"]) == 4

def test_bayesian_inference_low_risk():
    evidence = {
        "rainfall_mm_hr": 10.0,
        "water_level_cm": 5.0,
        "elevation_m": 580.0,
        "hazard_severity": 2.0
    }
    res = bayes_net_instance.predict(evidence)
    assert res["prob_road_unsafe"] < 0.30
    assert res["prob_road_safe"] > 0.70
