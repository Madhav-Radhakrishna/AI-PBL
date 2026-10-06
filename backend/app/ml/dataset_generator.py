import numpy as np
import pandas as pd

def generate_synthetic_road_risk_dataset(num_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic training dataset for road risk classification based on physical/geographical relationships:
    - High rainfall + low elevation + high water level -> high flooding & critical risk.
    - Close distance to hazard + high hazard severity -> critical risk.
    - High traffic + poor road condition + high population -> elevated risk.
    """
    np.random.seed(random_state)

    rainfall = np.random.uniform(0, 150, num_samples) # mm/hr
    water_level = np.random.uniform(0, 150, num_samples) # cm
    distance_from_hazard = np.random.uniform(0.1, 15.0, num_samples) # km
    hazard_severity = np.random.uniform(1, 10, num_samples) # 1 - 10 scale
    road_condition = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.4, 0.3, 0.2, 0.1]) # 0:Good, 1:Moderate, 2:Poor, 3:Damaged
    traffic_density = np.random.uniform(0, 100, num_samples) # %
    population_density = np.random.uniform(500, 25000, num_samples) # people / sq km
    elevation = np.random.uniform(450, 600, num_samples) # meters above sea level
    wind_speed = np.random.uniform(0, 120, num_samples) # km/hr

    # Compute a continuous underlying risk index based on realistic physics/disaster formulas
    # Base risk score 0 to 100
    flood_factor = (rainfall / 150.0 * 0.4) + (water_level / 150.0 * 0.4) + ((600 - elevation) / 150.0 * 0.2)
    hazard_factor = (hazard_severity / 10.0) * np.exp(-distance_from_hazard / 3.0)
    vulnerability_factor = (road_condition / 3.0 * 0.3) + (traffic_density / 100.0 * 0.4) + (population_density / 25000.0 * 0.3)

    raw_score = (flood_factor * 40.0) + (hazard_factor * 40.0) + (vulnerability_factor * 20.0)
    # Add minor noise
    noise = np.random.normal(0, 3.0, num_samples)
    risk_score = np.clip(raw_score + noise, 0, 100)

    # Classify into 4 categories:
    # SAFE: < 25
    # MODERATE: 25 - 50
    # HIGH RISK: 50 - 75
    # CRITICAL: >= 75
    risk_category = []
    for score in risk_score:
        if score < 25:
            risk_category.append("SAFE")
        elif score < 50:
            risk_category.append("MODERATE")
        elif score < 75:
            risk_category.append("HIGH RISK")
        else:
            risk_category.append("CRITICAL")

    df = pd.DataFrame({
        "rainfall": rainfall,
        "water_level": water_level,
        "distance_from_hazard": distance_from_hazard,
        "hazard_severity": hazard_severity,
        "road_condition": road_condition,
        "traffic_density": traffic_density,
        "population_density": population_density,
        "elevation": elevation,
        "wind_speed": wind_speed,
        "risk_score": risk_score,
        "risk_category": risk_category
    })

    return df

def generate_synthetic_traffic_dataset(num_samples: int = 1000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates synthetic dataset for predicting traffic congestion in 15-30 mins during evacuation.
    """
    np.random.seed(random_state)
    current_traffic = np.random.uniform(10, 95, num_samples)
    road_capacity = np.random.choice([1000, 2000, 3500, 5000], size=num_samples)
    population_density = np.random.uniform(1000, 20000, num_samples)
    evacuation_demand = np.random.uniform(100, 10000, num_samples)
    disaster_severity = np.random.uniform(1, 10, num_samples)

    # Predicted congestion
    surge = (evacuation_demand / road_capacity) * 25.0 + (disaster_severity * 3.0) + (population_density / 20000.0 * 15.0)
    predicted_congestion = np.clip(current_traffic + surge + np.random.normal(0, 5, num_samples), 0, 100)

    return pd.DataFrame({
        "current_traffic": current_traffic,
        "road_capacity": road_capacity,
        "population_density": population_density,
        "evacuation_demand": evacuation_demand,
        "disaster_severity": disaster_severity,
        "predicted_congestion": predicted_congestion
    })
