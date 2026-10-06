from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Disaster, WeatherData, Road, RoadCondition, TrafficData, Shelter, EvacuationZone, PopulationData
from app.seed_data import HYDERABAD_NODES
from app.schemas import PlanningGenerateRequest
from app.algorithms.planning import EvacuationPlanner
from app.routes.routing import get_current_graph_state

router = APIRouter(prefix="/planning", tags=["Classical & Dynamic Evacuation Planning"])

def _build_planner_context(db: Session):
    disaster = db.query(Disaster).first()
    weather = db.query(WeatherData).first()

    roads = db.query(Road).all()
    conditions = {rc.road_id: rc for rc in db.query(RoadCondition).all()}
    traffics = {t.road_id: t for t in db.query(TrafficData).all()}

    road_dicts = []
    for r in roads:
        rc = conditions.get(r.id)
        tr = traffics.get(r.id)
        road_dicts.append({
            "id": r.id,
            "name": r.name,
            "u": r.start_node_id,
            "v": r.end_node_id,
            "distance_km": r.distance_km,
            "is_blocked": rc.is_blocked if rc else False,
            "water_level_cm": rc.water_level_cm if rc else 0.0,
            "traffic_density": tr.traffic_density_pct if tr else 30.0,
            "elevation_meters": r.elevation_meters,
            "hazard_proximity_km": rc.hazard_proximity_km if rc else 3.0
        })

    zones = [
        {"id": z.id, "name": z.name, "population": p.population_count}
        for z, p in db.query(EvacuationZone, PopulationData).filter(EvacuationZone.id == PopulationData.zone_id).all()
    ]
    shelters = [
        {"id": s.id, "name": s.name, "capacity": s.capacity, "current_occupancy": s.current_occupancy, "risk_level": s.risk_level}
        for s in db.query(Shelter).all()
    ]

    disaster_dict = {
        "type": disaster.type if disaster else "Flood",
        "name": disaster.name if disaster else "Hyderabad Flood Emergency",
        "severity": disaster.severity if disaster else 8.0
    }
    weather_dict = {
        "rainfall_mm_hr": weather.rainfall_mm_hr if weather else 75.0,
        "wind_speed_kmh": weather.wind_speed_kmh if weather else 25.0
    }

    return disaster_dict, weather_dict, zones, shelters, road_dicts

def _get_strips_model(disaster_dict, zones, shelters, road_dicts, total_pop):
    blocked_count = len([r for r in road_dicts if r.get("is_blocked")])
    open_shelters_count = len(shelters)

    return {
        "initial_state": [
            f"ActiveDisaster({disaster_dict.get('type')}, Severity={disaster_dict.get('severity')}/10)",
            f"PopulationAtRisk(TotalCount={total_pop:,}, ZonesCount={len(zones)})",
            f"AvailableShelters(Count={open_shelters_count})",
            f"NetworkRoads(Operational={len(road_dicts) - blocked_count}, InundatedBlocked={blocked_count})",
            "EvacuationRoutesComputed(False)",
            "SafeStateAchieved(False)"
        ],
        "goal_state": [
            "EvacuatedAllZones(True)",
            "CapacityViolations(Count=0)",
            "HazardExposureMinimized(True)",
            "AllZoneCorridorsDeployed(True)",
            "SafeStateAchieved(True)"
        ],
        "operators": [
            {
                "name": "ASSESS_HAZARDS",
                "description": "Evaluate physical disaster telemetry using Decision Trees and Bayesian Uncertainty network.",
                "preconditions": ["ActiveDisaster()", "NetworkRoadsAvailable()"],
                "effects": ["RoadRisksAssessed()", "BayesianUncertaintyPriorsKnown()"]
            },
            {
                "name": "ALLOCATE_SHELTERS_CSP",
                "description": "Map evacuation population zones to candidate shelters subject to capacity and distance constraints using MRV Backtracking.",
                "preconditions": ["RoadRisksAssessed()", "PopulationAtRisk()", "AvailableShelters()"],
                "effects": ["ZonesAssignedToShelters()", "NoCapacityOverload()"]
            },
            {
                "name": "PLAN_ASTAR_CORRIDORS",
                "description": "Calculate minimum cost hazard-evading evacuation paths using admissible Euclidean + risk heuristic h(n).",
                "preconditions": ["ZonesAssignedToShelters()", "HeuristicsEstimated()"],
                "effects": ["OptimalEvacuationCorridorsActive()", "ETAsComputed()"]
            },
            {
                "name": "DEPLOY_DYNAMIC_DISPATCH",
                "description": "Transmit calculated corridors to emergency services and civilian dashboards with real-time replanning triggers.",
                "preconditions": ["OptimalEvacuationCorridorsActive()"],
                "effects": ["EvacuatedAllZones(True)", "SafeStateAchieved(True)"]
            }
        ]
    }

@router.get("/plan")
def get_evacuation_plan(db: Session = Depends(get_db)):
    disaster_dict, weather_dict, zones, shelters, road_dicts = _build_planner_context(db)
    planner = EvacuationPlanner(
        disaster_data=disaster_dict,
        zones=zones,
        shelters=shelters,
        roads=road_dicts,
        nodes=HYDERABAD_NODES
    )
    plan = planner.generate_full_plan(weather_dict)
    total_pop = sum(z["population"] for z in zones)
    plan["strips_representation"] = _get_strips_model(disaster_dict, zones, shelters, road_dicts, total_pop)
    return plan

@router.post("/generate")
def generate_custom_plan(req: PlanningGenerateRequest, db: Session = Depends(get_db)):
    disaster_dict, weather_dict, zones, shelters, road_dicts = _build_planner_context(db)

    # Strategy weights preset
    weights = req.weights
    if not weights:
        if req.strategy == "SAFETY_FIRST":
            weights = {
                "w_distance": 0.10,
                "w_travel_time": 0.10,
                "w_hazard_risk": 0.60,
                "w_traffic": 0.10,
                "w_future_risk": 0.10
            }
        elif req.strategy == "FASTEST":
            weights = {
                "w_distance": 0.35,
                "w_travel_time": 0.45,
                "w_hazard_risk": 0.10,
                "w_traffic": 0.05,
                "w_future_risk": 0.05
            }
        else: # BALANCED
            weights = {
                "w_distance": 0.20,
                "w_travel_time": 0.20,
                "w_hazard_risk": 0.40,
                "w_traffic": 0.10,
                "w_future_risk": 0.10
            }

    if req.disaster_severity is not None:
        disaster_dict["severity"] = req.disaster_severity
    if req.rainfall_mm_hr is not None:
        weather_dict["rainfall_mm_hr"] = req.rainfall_mm_hr

    planner = EvacuationPlanner(
        disaster_data=disaster_dict,
        zones=zones,
        shelters=shelters,
        roads=road_dicts,
        nodes=HYDERABAD_NODES
    )
    plan = planner.generate_full_plan(weather_dict, weights=weights)
    total_pop = sum(z["population"] for z in zones)
    plan["strategy"] = req.strategy
    plan["weights_used"] = weights
    plan["strips_representation"] = _get_strips_model(disaster_dict, zones, shelters, road_dicts, total_pop)
    return plan

@router.get("/strips")
def get_strips_representation(db: Session = Depends(get_db)):
    disaster_dict, weather_dict, zones, shelters, road_dicts = _build_planner_context(db)
    total_pop = sum(z["population"] for z in zones)
    return _get_strips_model(disaster_dict, zones, shelters, road_dicts, total_pop)
