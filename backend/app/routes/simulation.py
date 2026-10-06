import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Disaster, WeatherData, RoadCondition, Shelter, TrafficData, Road, Alert, EvacuationZone, PopulationData
from app.schemas import SimulationUpdateRequest
from app.seed_data import HYDERABAD_NODES
from app.algorithms.planning import EvacuationPlanner

router = APIRouter(prefix="/simulation", tags=["Simulation Lab & Dynamic Replanning"])

@router.get("/current-state")
def get_simulation_state(db: Session = Depends(get_db)):
    disaster = db.query(Disaster).first()
    weather = db.query(WeatherData).first()
    blocked_count = db.query(RoadCondition).filter(RoadCondition.is_blocked == True).count()
    shelters = db.query(Shelter).all()
    roads = db.query(Road).all()
    traffic_avg = db.query(TrafficData).all()

    avg_traffic = sum(t.traffic_density_pct for t in traffic_avg) / max(len(traffic_avg), 1)

    return {
        "disaster": {
            "type": disaster.type if disaster else "Flood",
            "name": disaster.name if disaster else "Hyderabad Flood Emergency",
            "severity": disaster.severity if disaster else 8.0,
            "affected_radius": disaster.affected_radius if disaster else 3.5,
            "status": disaster.status if disaster else "ACTIVE"
        },
        "weather": {
            "rainfall_mm_hr": weather.rainfall_mm_hr if weather else 75.0,
            "wind_speed_kmh": weather.wind_speed_kmh if weather else 25.0,
            "water_level_avg_cm": 80.0
        },
        "stats": {
            "affected_population": 18420,
            "open_shelters": len(shelters),
            "blocked_roads_count": blocked_count,
            "total_roads_count": len(roads),
            "avg_traffic_pct": round(avg_traffic, 1)
        }
    }

@router.post("/update")
def update_simulation(req: SimulationUpdateRequest, db: Session = Depends(get_db)):
    disaster = db.query(Disaster).first()
    weather = db.query(WeatherData).first()

    reasons = []

    # Update disaster severity
    if req.disaster_severity is not None:
        disaster.severity = req.disaster_severity
        reasons.append(f"Disaster severity adjusted to {req.disaster_severity:.1f}/10")

    # Update rainfall
    if req.rainfall_mm_hr is not None:
        weather.rainfall_mm_hr = req.rainfall_mm_hr
        reasons.append(f"Rainfall intensity changed to {req.rainfall_mm_hr:.1f} mm/hr")

    # Update traffic
    if req.traffic_density_pct is not None:
        for tf in db.query(TrafficData).all():
            tf.traffic_density_pct = req.traffic_density_pct
            tf.predicted_density_15m = min(req.traffic_density_pct + 15.0, 100.0)
        reasons.append(f"Network traffic density increased to {req.traffic_density_pct:.0f}%")

    # Block specific road or random road
    if req.block_road_id is not None:
        road_to_block = req.block_road_id
        if road_to_block == "RANDOM":
            unblocked = db.query(RoadCondition).filter(RoadCondition.is_blocked == False).all()
            if unblocked:
                rc = random.choice(unblocked)
                rc.is_blocked = True
                rc.water_level_cm = 120.0
                r_obj = db.query(Road).filter(Road.id == rc.road_id).first()
                reasons.append(f"Road '{r_obj.name if r_obj else rc.road_id}' became BLOCKED by flood waters")
        else:
            rc = db.query(RoadCondition).filter(RoadCondition.road_id == road_to_block).first()
            if rc:
                rc.is_blocked = True
                rc.water_level_cm = 120.0
                r_obj = db.query(Road).filter(Road.id == rc.road_id).first()
                reasons.append(f"Road '{r_obj.name if r_obj else road_to_block}' was explicitly BLOCKED")

    # Fill shelter occupancy
    if req.fill_shelter_id is not None:
        target_s = req.fill_shelter_id
        fill_amt = req.fill_amount or 1500
        if target_s == "RANDOM":
            shelters = db.query(Shelter).all()
            s_obj = random.choice(shelters)
            s_obj.current_occupancy = min(s_obj.current_occupancy + fill_amt, s_obj.capacity)
            reasons.append(f"Shelter '{s_obj.name}' occupancy surge (+{fill_amt} evacuees, now at {s_obj.current_occupancy}/{s_obj.capacity})")
        else:
            s_obj = db.query(Shelter).filter(Shelter.id == target_s).first()
            if s_obj:
                s_obj.current_occupancy = min(s_obj.current_occupancy + fill_amt, s_obj.capacity)
                reasons.append(f"Shelter '{s_obj.name}' filled (now at {s_obj.current_occupancy}/{s_obj.capacity})")

    db.commit()

    # Dynamic Replanning Trigger
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

    zones = [{"id": z.id, "name": z.name, "population": p.population_count} for z, p in db.query(EvacuationZone, PopulationData).filter(EvacuationZone.id == PopulationData.zone_id).all()]
    shelters = [{"id": s.id, "name": s.name, "capacity": s.capacity, "current_occupancy": s.current_occupancy, "risk_level": s.risk_level} for s in db.query(Shelter).all()]

    planner = EvacuationPlanner(
        disaster_data={"type": disaster.type, "severity": disaster.severity},
        zones=zones,
        shelters=shelters,
        roads=road_dicts,
        nodes=HYDERABAD_NODES
    )
    weather_dict = {"rainfall_mm_hr": weather.rainfall_mm_hr, "wind_speed_kmh": weather.wind_speed_kmh}
    updated_plan = planner.generate_full_plan(weather_dict)

    # Post alert to database
    alert_msg = " + ".join(reasons) if reasons else "Disaster environment updated."
    alert_obj = Alert(
        title="⚠️ EVACUATION PLAN UPDATED",
        message=f"Dynamic replanning executed automatically.\nReasons:\n" + "\n".join(f"• {r}" for r in reasons),
        severity="WARNING"
    )
    db.add(alert_obj)
    db.commit()

    return {
        "status": "RECALCULATED",
        "reasons": reasons,
        "alert": {
            "title": alert_obj.title,
            "message": alert_obj.message,
            "created_at": alert_obj.created_at
        },
        "updated_plan": updated_plan
    }
