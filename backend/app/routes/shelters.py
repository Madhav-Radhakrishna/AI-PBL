from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Shelter, EvacuationZone, PopulationData, Road, RoadCondition
from app.schemas import LocalSearchRequest
from app.algorithms.csp import ShelterCSP
from app.algorithms.local_search import LocalSearchOptimizer
from app.algorithms.search import compute_euclidean_distance

router = APIRouter(prefix="/shelters", tags=["Shelters & CSP"])

@router.get("/")
def get_shelters(db: Session = Depends(get_db)):
    shelters = db.query(Shelter).all()
    res = []
    for s in shelters:
        avail = max(s.capacity - s.current_occupancy, 0)
        occ_pct = round((s.current_occupancy / max(s.capacity, 1)) * 100, 1)
        res.append({
            "id": s.id,
            "name": s.name,
            "lat": s.lat,
            "lng": s.lng,
            "capacity": s.capacity,
            "current_occupancy": s.current_occupancy,
            "available_capacity": avail,
            "occupancy_pct": occ_pct,
            "facilities": s.facilities or [],
            "risk_level": s.risk_level,
            "status": s.status
        })
    return res

@router.get("/solve-csp")
def solve_shelter_csp(max_distance_km: float = 25.0, db: Session = Depends(get_db)):
    shelter_objs = db.query(Shelter).all()
    zone_objs = db.query(EvacuationZone).all()
    pop_objs = {p.zone_id: p for p in db.query(PopulationData).all()}
    road_conds = {rc.road_id: rc for rc in db.query(RoadCondition).all()}
    roads = db.query(Road).all()

    shelters = [
        {
            "id": s.id,
            "name": s.name,
            "capacity": s.capacity,
            "current_occupancy": s.current_occupancy,
            "risk_level": s.risk_level
        }
        for s in shelter_objs
    ]

    zones = [
        {
            "id": z.id,
            "name": z.name,
            "population": pop_objs[z.id].population_count if z.id in pop_objs else 2000
        }
        for z in zone_objs
    ]

    # Calculate Euclidean distance matrix
    dist_matrix = {}
    z_map = {z.id: z for z in zone_objs}
    s_map = {s.id: s for s in shelter_objs}

    for zid in z_map:
        for sid in s_map:
            z = z_map[zid]
            s = s_map[sid]
            dist_matrix[(zid, sid)] = compute_euclidean_distance(z.lat, z.lng, s.lat, s.lng)

    solver = ShelterCSP(zones, shelters, dist_matrix)
    res = solver.solve()
    return res

@router.post("/optimize-local-search")
def optimize_local_search(req: LocalSearchRequest, db: Session = Depends(get_db)):
    shelter_objs = db.query(Shelter).all()
    zone_objs = db.query(EvacuationZone).all()
    pop_objs = {p.zone_id: p for p in db.query(PopulationData).all()}

    shelters = [{"id": s.id, "capacity": s.capacity} for s in shelter_objs]
    zones = [{"id": z.id, "population": pop_objs[z.id].population_count if z.id in pop_objs else 2000} for z in zone_objs]

    dist_matrix = {}
    for z in zone_objs:
        for s in shelter_objs:
            dist_matrix[(z.id, s.id)] = compute_euclidean_distance(z.lat, z.lng, s.lat, s.lng)

    opt = LocalSearchOptimizer(zones, shelters, dist_matrix)
    alg = req.algorithm.lower()
    if alg.startswith("simulated"):
        return opt.simulated_annealing(max_iterations=req.max_iterations)
    elif alg.startswith("genetic"):
        return opt.genetic_algorithm(generations=min(req.max_iterations, 150))
    else:
        return opt.hill_climbing(max_iterations=req.max_iterations)
