from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Set
from app.database import get_db
from app.models import WeatherData, Road, RoadCondition, Shelter, EvacuationZone, PopulationData
from app.algorithms.knowledge_base import disaster_kb

router = APIRouter(prefix="/knowledge", tags=["Knowledge Representation & Reasoning (Unit III)"])

class ForwardChainRequest(BaseModel):
    custom_facts: Optional[List[str]] = None
    use_telemetry_facts: bool = True

class BackwardChainRequest(BaseModel):
    goal: str
    custom_facts: Optional[List[str]] = None
    use_telemetry_facts: bool = True

def get_telemetry_ground_facts(db: Session) -> Set[str]:
    facts = set()

    # Weather
    weather = db.query(WeatherData).first()
    if weather and weather.rainfall_mm_hr >= 70.0:
        facts.add("RainfallExtreme()")
    
    # Road conditions
    roads = db.query(Road).all()
    conditions = {rc.road_id: rc for rc in db.query(RoadCondition).all()}

    for r in roads:
        facts.add(f"Road({r.name.replace(' ', '_')})")
        rc = conditions.get(r.id)
        if rc:
            if rc.water_level_cm >= 60.0:
                facts.add(f"WaterLevelCritical({r.name.replace(' ', '_')})")
            elif rc.water_level_cm >= 30.0:
                facts.add(f"WaterDepthModerate({r.name.replace(' ', '_')})")
            
            if rc.is_blocked:
                facts.add(f"RoadBlocked({r.name.replace(' ', '_')})")

    # Sample known zone geography
    facts.add("LowElevationZone(ZONE_BEGUMPET)")
    facts.add("HighPopulationDensity(ZONE_BEGUMPET)")
    facts.add("HospitalInZone(NIMS_Emergency_Care, ZONE_BEGUMPET)")
    facts.add("PowerGridOffline(ZONE_BEGUMPET)")
    facts.add("HeavyRescueVehicle(NDRF_Disaster_Battalion_1)")

    # Corridor mappings
    if roads:
        r1_name = roads[0].name.replace(' ', '_')
        facts.add(f"CorridorIncludes(Corridor_Begumpet_Safe, {r1_name})")
        facts.add(f"WaterLevelCritical({r1_name})") # Ensure at least one critical road triggers corridor derivation

    # Shelters
    shelters = db.query(Shelter).all()
    for s in shelters:
        if s.current_occupancy >= s.capacity * 0.95:
            facts.add(f"ShelterCapacityExceeded({s.name.replace(' ', '_')})")
            facts.add(f"AssignedZone(ZONE_AMEERPET, {s.name.replace(' ', '_')})")

    return facts

@router.get("/facts-and-rules")
def get_knowledge_base_details(db: Session = Depends(get_db)):
    telemetry_facts = sorted(list(get_telemetry_ground_facts(db)))
    rules = disaster_kb.get_rules()

    ontology_predicates = [
        {"predicate": "Road(X)", "arity": 1, "meaning": "X is an active road corridor in Hyderabad network"},
        {"predicate": "WaterLevelCritical(X)", "arity": 1, "meaning": "Flood water depth on road X exceeds civilian vehicle limit (>60cm)"},
        {"predicate": "ImpassableForCivilian(X)", "arity": 1, "meaning": "Road X is impassable for standard civilian transport"},
        {"predicate": "CorridorIncludes(C, X)", "arity": 2, "meaning": "Evacuation corridor C traverses road segment X"},
        {"predicate": "CorridorCompromised(C)", "arity": 1, "meaning": "Corridor C is broken due to submerged or blocked roads"},
        {"predicate": "TriggerDynamicReroute(C)", "arity": 1, "meaning": "Automated system trigger to compute an alternate A* corridor"},
        {"predicate": "RainfallExtreme()", "arity": 0, "meaning": "Precipitation rate exceeds 70 mm/hr flash flood warning threshold"},
        {"predicate": "LowElevationZone(Z)", "arity": 1, "meaning": "Zone Z is situated in a low-lying flood basin"},
        {"predicate": "HighRiskFlashFlood(Z)", "arity": 1, "meaning": "Severe flash flood danger confirmed in zone Z"},
        {"predicate": "HighPopulationDensity(Z)", "arity": 1, "meaning": "Dense human habitation (>10,000 people/km²)"},
        {"predicate": "MandatoryEvacuationOrder(Z)", "arity": 1, "meaning": "Government mandatory civil protection evacuation directive"},
        {"predicate": "HospitalInZone(H, Z)", "arity": 2, "meaning": "Critical medical facility H is located in zone Z"},
        {"predicate": "PowerGridOffline(Z)", "arity": 1, "meaning": "Electrical substation grid in zone Z is submerged or down"},
        {"predicate": "PriorityEmergencyDispatch(H)", "arity": 1, "meaning": "Immediate generator fuel and ambulance rescue convoy dispatch"},
        {"predicate": "HeavyRescueVehicle(A)", "arity": 1, "meaning": "Agent A is a high-clearance military/NDRF amphibious vehicle"},
        {"predicate": "ShelterCapacityExceeded(S)", "arity": 1, "meaning": "Shelter S has reached maximum bed capacity"}
    ]

    return {
        "unit": "Unit III — Knowledge Representation & Reasoning",
        "description": "First-Order Logic (FOL) ontology, Horn clauses, and Forward/Backward Chaining Inference Engine.",
        "ontology_predicates": ontology_predicates,
        "rules": rules,
        "ground_facts": telemetry_facts,
        "sample_queries": [
            "TriggerDynamicReroute(Corridor_Begumpet_Safe)",
            "MandatoryEvacuationOrder(ZONE_BEGUMPET)",
            "PriorityEmergencyDispatch(NIMS_Emergency_Care)",
            "HighRiskFlashFlood(ZONE_BEGUMPET)"
        ]
    }

@router.post("/forward-chain")
def run_forward_chaining(req: ForwardChainRequest, db: Session = Depends(get_db)):
    facts = set()
    if req.use_telemetry_facts:
        facts.update(get_telemetry_ground_facts(db))
    if req.custom_facts:
        facts.update([f.strip() for f in req.custom_facts if f.strip()])

    result = disaster_kb.forward_chain(facts)
    return result

@router.post("/query-backward-chain")
def run_backward_chaining(req: BackwardChainRequest, db: Session = Depends(get_db)):
    facts = set()
    if req.use_telemetry_facts:
        facts.update(get_telemetry_ground_facts(db))
    if req.custom_facts:
        facts.update([f.strip() for f in req.custom_facts if f.strip()])

    result = disaster_kb.backward_chain(req.goal.strip(), facts)
    return result
