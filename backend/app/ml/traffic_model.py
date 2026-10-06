import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from app.ml.dataset_generator import generate_synthetic_traffic_dataset

class TrafficPredictionModel:
    def __init__(self):
        self.feature_cols = [
            "current_traffic",
            "road_capacity",
            "population_density",
            "evacuation_demand",
            "disaster_severity"
        ]
        self.model = None
        self.train_model()

    def train_model(self):
        df = generate_synthetic_traffic_dataset(num_samples=1000, random_state=42)
        X = df[self.feature_cols]
        y = df["predicted_congestion"]

        self.model = DecisionTreeRegressor(max_depth=5, random_state=42)
        self.model.fit(X, y)

    def predict(self, features: dict, base_travel_time_min: float = 10.0) -> dict:
        input_data = [features.get(col, 0.0) for col in self.feature_cols]
        X_in = pd.DataFrame([input_data], columns=self.feature_cols)
        pred_congestion = float(self.model.predict(X_in)[0])
        pred_congestion = float(np.clip(pred_congestion, 0, 100))

        # Travel time factor increases exponentially as traffic reaches capacity
        congestion_factor = 1.0 + (pred_congestion / 100.0) ** 2 * 2.5
        predicted_travel_time = round(base_travel_time_min * congestion_factor, 1)

        return {
            "current_traffic_pct": features.get("current_traffic", 35.0),
            "predicted_congestion_pct": round(pred_congestion, 1),
            "base_travel_time_min": base_travel_time_min,
            "predicted_travel_time_min": predicted_travel_time
        }

traffic_model_instance = TrafficPredictionModel()
