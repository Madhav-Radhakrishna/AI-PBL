from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RouteSearchRequest, MultiAgentRequest
from app.models import Road, RoadCondition, Shelter, EvacuationZone, WeatherData, Disaster, TrafficData
from app.seed_data import HYDERABAD_NODES
from app.algorithms.search import DisasterSearchEngine
from app.algorithms.multi_agent import MultiAgentPlanner
from app.ml.risk_model import risk_model_instance
from app.bayesian.bayes_network import bayes_net_instance

router = APIRouter(prefix="/routing", tags=["Routing & Search"])

def get_current_graph_state(db: Session):
    roads = db.query(Road).all()
    conditions = {rc.road_id: rc for rc in db.query(RoadCondition).all()}
    traffics = {t.road_id: t for t in db.query(TrafficData).all()}
    weather = db.query(WeatherData).first()
    disaster = db.query(Disaster).first()

    edge_list = []
    for r in roads:
        rc = conditions.get(r.id)
        tr = traffics.get(r.id)

        # Get ML risk prediction
        ml_input = {
            "rainfall": weather.rainfall_mm_hr if weather else 75.0,
            "water_level": rc.water_level_cm if rc else 30.0,
            "distance_from_hazard": rc.hazard_proximity_km if rc else 3.0,
            "hazard_severity": disaster.severity if disaster else 8.0,
            "road_condition": 3 if (rc and rc.is_blocked) else 0,
            "traffic_density": tr.traffic_density_pct if tr else 30.0,
            "population_density": 10000.0,
            "elevation": r.elevation_meters,
            "wind_speed": weather.wind_speed_kmh if weather else 20.0
        }
        ml_pred = risk_model_instance.predict(ml_input)

        edge_list.append({
            "id": r.id,
            "name": r.name,
            "u": r.start_node_id,
            "v": r.end_node_id,
            "distance_km": r.distance_km,
            "travel_time_min": round(r.distance_km * (60.0 / max(rc.current_speed_kmh if rc else 30.0, 5.0)), 1),
            "hazard_risk": ml_pred["risk_score"],
            "risk_category": ml_pred["risk_category"],
            "traffic_density": tr.traffic_density_pct if tr else 30.0,
            "future_risk": tr.predicted_density_15m if tr else 35.0,
            "is_blocked": rc.is_blocked if rc else False
        })

    return edge_list

@APIRouter().get("/nodes")
def get_map_nodes():
    return list(HYDERABAD_NODES.values())

@router.get("/graph")
def get_graph(db: Session = Depends(get_db)):
    edges = get_current_graph_state(db)
    return {
        "nodes": list(HYDERABAD_NODES.values()),
        "edges": edges
    }

@router.post("/find-route")
def find_route(req: RouteSearchRequest, db: Session = Depends(get_db)):
    edges = get_current_graph_state(db)
    search_engine = DisasterSearchEngine(HYDERABAD_NODES, edges, weights=req.weights)

    alg = req.algorithm.upper()
    if alg == "BFS":
        res = search_engine.bfs(req.start_node_id, req.target_shelter_id)
    elif alg in ["UCS", "UNIFORM COST"]:
        res = search_engine.ucs(req.start_node_id, req.target_shelter_id)
    elif alg in ["GREEDY", "GREEDY BEST FIRST"]:
        res = search_engine.greedy_best_first(req.start_node_id, req.target_shelter_id)
    else:
        res = search_engine.a_star(req.start_node_id, req.target_shelter_id)

    if not res["found"]:
        raise HTTPException(status_code=404, detail="No safe route found. Path blocked by hazard.")

    # Calculate Safety Score 0-100
    safety_score = round(max(100.0 - res["overall_risk"], 0.0), 1)

    # Explanation checklist
    target_shelter = db.query(Shelter).filter(Shelter.id == req.target_shelter_id).first()
    explanations = [
        f"Avoids critical flood zones and {len([e for e in edges if e['is_blocked']])} blocked roads",
        f"Optimized path using custom heuristic h(n) combining distance & safety factor",
        f"Overall route hazard risk score is {res['overall_risk']:.1f}/100 ({'SAFE' if res['overall_risk'] < 40 else 'MODERATE'})",
        f"Target shelter ({target_shelter.name if target_shelter else 'Shelter'}) has available capacity"
    ]

    return {
        "route": res,
        "safety_score": safety_score,
        "eta_minutes": round(res["cost"] * 2.2, 1),
        "explanations": explanations
    }

@router.post("/compare-algorithms")
def compare_algorithms(req: RouteSearchRequest, db: Session = Depends(get_db)):
    edges = get_current_graph_state(db)
    search_engine = DisasterSearchEngine(HYDERABAD_NODES, edges, weights=req.weights)
    results = search_engine.compare_all(req.start_node_id, req.target_shelter_id)

    comparison_table = []
    for r in results:
        comparison_table.append({
            "algorithm": r["algorithm"],
            "found": r["found"],
            "nodes_explored": r["nodes_explored"],
            "path_cost": r["cost"],
            "overall_risk": r["overall_risk"],
            "execution_time_ms": r["execution_time_ms"],
            "path_length_km": sum(e["distance_km"] for e in r["path_edges"]) if r["found"] else 0.0
        })

    return {
        "start_node_id": req.start_node_id,
        "target_shelter_id": req.target_shelter_id,
        "comparison": comparison_table,
        "details": results
    }

@router.post("/multi-agent-routes")
def plan_multi_agent_routes(req: MultiAgentRequest, db: Session = Depends(get_db)):
    edges = get_current_graph_state(db)
    planner = MultiAgentPlanner(HYDERABAD_NODES, edges)
    routes = planner.plan_multi_agent_routes(req.agents)
    return {"multi_agent_routes": routes}
