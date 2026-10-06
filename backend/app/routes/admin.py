from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Disaster, Shelter, RoadCondition, PopulationData, Alert

router = APIRouter(prefix="/admin", tags=["Emergency Admin Command Center"])

@router.get("/summary")
def get_admin_summary(db: Session = Depends(get_db)):
    active_disasters = db.query(Disaster).filter(Disaster.status == "ACTIVE").count()
    pops = db.query(PopulationData).all()
    total_affected = sum(p.population_count for p in pops)

    shelters = db.query(Shelter).all()
    open_shelters = len(shelters)
    available_capacity = sum(max(s.capacity - s.current_occupancy, 0) for s in shelters)

    blocked_roads = db.query(RoadCondition).filter(RoadCondition.is_blocked == True).count()
    high_risk_roads = db.query(RoadCondition).filter(RoadCondition.water_level_cm >= 50.0).count()

    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(10).all()

    return {
        "metrics": {
            "active_disasters": active_disasters,
            "affected_people": total_affected,
            "open_shelters": open_shelters,
            "available_capacity": available_capacity,
            "blocked_roads": blocked_roads,
            "high_risk_roads": high_risk_roads,
            "active_evacuations": len(pops)
        },
        "recent_alerts": [
            {
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "severity": a.severity,
                "created_at": a.created_at
            }
            for a in alerts
        ]
    }
