from fastapi import APIRouter
from app.schemas import RiskPredictionRequest, BayesianRequest
from app.ml.risk_model import risk_model_instance
from app.ml.traffic_model import traffic_model_instance
from app.bayesian.bayes_network import bayes_net_instance

router = APIRouter(prefix="/ai-engine", tags=["AI ML & Bayesian Engines"])

@router.post("/predict-risk")
def predict_road_risk(req: RiskPredictionRequest):
    features = req.model_dump()
    res = risk_model_instance.predict(features)
    return res

@router.get("/decision-tree-structure")
def get_decision_tree_structure():
    return {
        "tree": risk_model_instance.get_tree_structure(),
        "feature_importances": dict(zip(
            risk_model_instance.feature_cols,
            [float(x) for x in risk_model_instance.dt_model.feature_importances_]
        ))
    }

@router.post("/bayesian-uncertainty")
def predict_bayesian_uncertainty(req: BayesianRequest):
    evidence = req.model_dump()
    res = bayes_net_instance.predict(evidence)
    return res

@router.get("/bayesian-network-dag")
def get_bayesian_network_dag():
    return {
        "nodes": [
            {"id": "Rainfall", "label": "Rainfall Intensity", "type": "EVIDENCE"},
            {"id": "WaterLevel", "label": "Flood Water Level", "type": "EVIDENCE"},
            {"id": "Elevation", "label": "Terrain Elevation", "type": "EVIDENCE"},
            {"id": "HazardSeverity", "label": "Disaster Severity", "type": "EVIDENCE"},
            {"id": "Flooding", "label": "Probability of Flooding", "type": "INTERMEDIATE"},
            {"id": "RoadUnsafe", "label": "Probability of Road Unsafe", "type": "TARGET"}
        ],
        "edges": [
            {"from": "Rainfall", "to": "Flooding"},
            {"from": "WaterLevel", "to": "Flooding"},
            {"from": "Elevation", "to": "Flooding"},
            {"from": "Flooding", "to": "RoadUnsafe"},
            {"from": "HazardSeverity", "to": "RoadUnsafe"}
        ],
        "priors": bayes_net_instance.priors
    }
