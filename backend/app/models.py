from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="CITIZEN") # CITIZEN, ADMIN, EMERGENCY_RESPONDER
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Disaster(Base):
    __tablename__ = "disasters"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # Flood, Fire, Earthquake, Cyclone, Gas Leak, Landslide
    name = Column(String, nullable=False)
    severity = Column(Float, default=8.0) # 1.0 - 10.0
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    affected_radius = Column(Float, default=2.5) # in km
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class Hazard(Base):
    __tablename__ = "hazards"
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"))
    hazard_type = Column(String, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=2.0)
    intensity = Column(Float, default=8.0)
    polygon = Column(JSON, nullable=True) # GeoJSON style coordinates array
    created_at = Column(DateTime, default=datetime.utcnow)

class Road(Base):
    __tablename__ = "roads"
    id = Column(String, primary_key=True, index=True) # e.g. "R_BEGUMPET_PUNJAGUTTA"
    name = Column(String, nullable=False)
    start_node_id = Column(String, nullable=False)
    end_node_id = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)
    road_condition = Column(String, default="Good") # Good, Moderate, Poor, Damaged
    elevation_meters = Column(Float, default=500.0)
    capacity_vph = Column(Integer, default=2000)

class RoadCondition(Base):
    __tablename__ = "road_conditions"
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(String, ForeignKey("roads.id"), nullable=False)
    is_blocked = Column(Boolean, default=False)
    water_level_cm = Column(Float, default=0.0)
    current_speed_kmh = Column(Float, default=40.0)
    hazard_proximity_km = Column(Float, default=5.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(String, primary_key=True, index=True) # e.g. "SHELTER_BEGUMPET_COMMUNITY"
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    facilities = Column(JSON, default=list) # ["Medical", "Food", "Water", "Helipad"]
    risk_level = Column(String, default="LOW")
    status = Column(String, default="OPEN")

class EvacuationZone(Base):
    __tablename__ = "evacuation_zones"
    id = Column(String, primary_key=True, index=True) # e.g. "ZONE_AMEERPET"
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    polygon = Column(JSON, nullable=True)

class PopulationData(Base):
    __tablename__ = "population_data"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("evacuation_zones.id"), nullable=False)
    population_count = Column(Integer, nullable=False)
    vulnerable_count = Column(Integer, default=0) # Elderly, children, injured
    assigned_shelter_id = Column(String, ForeignKey("shelters.id"), nullable=True)

class WeatherData(Base):
    __tablename__ = "weather_data"
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"))
    rainfall_mm_hr = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=10.0)
    temperature_c = Column(Float, default=28.0)
    visibility_km = Column(Float, default=10.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class TrafficData(Base):
    __tablename__ = "traffic_data"
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(String, ForeignKey("roads.id"), nullable=False)
    traffic_density_pct = Column(Float, default=20.0) # 0 to 100%
    predicted_density_15m = Column(Float, default=25.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(String, ForeignKey("roads.id"), nullable=False)
    risk_score = Column(Float, nullable=False) # 0 - 100
    risk_category = Column(String, nullable=False) # SAFE, MODERATE, HIGH RISK, CRITICAL
    confidence = Column(Float, nullable=False)
    features_used = Column(JSON, nullable=True)
    predicted_at = Column(DateTime, default=datetime.utcnow)

class BayesianPrediction(Base):
    __tablename__ = "bayesian_predictions"
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(String, ForeignKey("roads.id"), nullable=False)
    prob_flooding = Column(Float, nullable=False)
    prob_road_unsafe = Column(Float, nullable=False)
    evidence = Column(JSON, nullable=False)
    predicted_at = Column(DateTime, default=datetime.utcnow)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    start_node_id = Column(String, nullable=False)
    target_shelter_id = Column(String, nullable=False)
    algorithm_used = Column(String, nullable=False) # A*, BFS, UCS, GREEDY
    path_nodes = Column(JSON, nullable=False)
    distance_km = Column(Float, nullable=False)
    eta_minutes = Column(Float, nullable=False)
    overall_risk_score = Column(Float, nullable=False)
    safety_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class EvacuationPlan(Base):
    __tablename__ = "evacuation_plans"
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"))
    plan_data = Column(JSON, nullable=False) # Structured plan steps
    total_affected = Column(Integer, nullable=False)
    cost_score = Column(Float, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO") # INFO, WARNING, CRITICAL
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    inputs = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
