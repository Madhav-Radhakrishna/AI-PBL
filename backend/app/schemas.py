from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class RiskPredictionRequest(BaseModel):
    rainfall: float = 75.0
    water_level: float = 80.0
    distance_from_hazard: float = 1.0
    hazard_severity: float = 8.0
    road_condition: int = 2 # 0=Good, 1=Moderate, 2=Poor, 3=Damaged
    traffic_density: float = 70.0
    population_density: float = 12000.0
    elevation: float = 490.0
    wind_speed: float = 25.0

class BayesianRequest(BaseModel):
    rainfall_mm_hr: float = 75.0
    water_level_cm: float = 80.0
    elevation_m: float = 490.0
    hazard_severity: float = 8.0

class RouteSearchRequest(BaseModel):
    start_node_id: str = "ZONE_BEGUMPET"
    target_shelter_id: str = "SHELTER_GACHIBOWLI"
    algorithm: str = "A*" # A*, BFS, UCS, GREEDY
    weights: Optional[Dict[str, float]] = None

class SimulationUpdateRequest(BaseModel):
    disaster_severity: Optional[float] = None
    rainfall_mm_hr: Optional[float] = None
    water_level_cm: Optional[float] = None
    traffic_density_pct: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    block_road_id: Optional[str] = None
    fill_shelter_id: Optional[str] = None
    fill_amount: Optional[int] = None

class MultiAgentRequest(BaseModel):
    agents: List[Dict[str, str]]

class LocalSearchRequest(BaseModel):
    algorithm: str = "Hill Climbing" # Hill Climbing, Simulated Annealing, or Genetic Algorithm
    max_iterations: int = 200

class CSPRequest(BaseModel):
    max_distance_km: float = 25.0

class PlanningGenerateRequest(BaseModel):
    strategy: Optional[str] = "BALANCED" # SAFETY_FIRST, FASTEST, BALANCED
    weights: Optional[Dict[str, float]] = None
    rainfall_mm_hr: Optional[float] = None
    disaster_severity: Optional[float] = None

class SimulationResetRequest(BaseModel):
    preset: Optional[str] = "DEFAULT"
