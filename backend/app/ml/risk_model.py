import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text, _tree
from sklearn.ensemble import RandomForestClassifier
from app.ml.dataset_generator import generate_synthetic_road_risk_dataset

class RoadRiskMLModel:
    def __init__(self):
        self.feature_cols = [
            "rainfall",
            "water_level",
            "distance_from_hazard",
            "hazard_severity",
            "road_condition",
            "traffic_density",
            "population_density",
            "elevation",
            "wind_speed"
        ]
        self.categories = ["SAFE", "MODERATE", "HIGH RISK", "CRITICAL"]
        self.dt_model = None
        self.rf_model = None
        self.is_trained = False
        self.train_model()

    def train_model(self):
        df = generate_synthetic_road_risk_dataset(num_samples=2000, random_state=42)
        X = df[self.feature_cols]
        y = df["risk_category"]

        # Train Decision Tree (max_depth=4 for interpretability)
        self.dt_model = DecisionTreeClassifier(max_depth=4, random_state=42, criterion="gini")
        self.dt_model.fit(X, y)

        # Train Random Forest
        self.rf_model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        self.rf_model.fit(X, y)

        self.is_trained = True

    def predict(self, features: dict) -> dict:
        """
        features input format:
        {
          "rainfall": 78.0,
          "water_level": 82.0,
          "distance_from_hazard": 0.7,
          "hazard_severity": 8.0,
          "road_condition": 2, # 0=Good, 1=Moderate, 2=Poor, 3=Damaged
          "traffic_density": 71.0,
          "population_density": 12000.0,
          "elevation": 490.0,
          "wind_speed": 40.0
        }
        """
        input_data = [features.get(col, 0.0) for col in self.feature_cols]
        X_in = pd.DataFrame([input_data], columns=self.feature_cols)

        # Get class probabilities
        probs = self.dt_model.predict_proba(X_in)[0]
        classes = list(self.dt_model.classes_)
        pred_idx = np.argmax(probs)
        pred_category = classes[pred_idx]
        confidence = float(probs[pred_idx])

        # Calculate continuous score 0-100 derived from physics & RF probabilities
        cat_weights = {"SAFE": 15, "MODERATE": 40, "HIGH RISK": 65, "CRITICAL": 90}
        rf_probs = self.rf_model.predict_proba(X_in)[0]
        rf_classes = list(self.rf_model.classes_)

        expected_score = 0.0
        for idx, cls in enumerate(rf_classes):
            expected_score += rf_probs[idx] * cat_weights.get(cls, 50)

        # Refine score using features directly
        rainfall = features.get("rainfall", 0)
        water = features.get("water_level", 0)
        dist = features.get("distance_from_hazard", 5.0)
        sev = features.get("hazard_severity", 5.0)
        cond = features.get("road_condition", 0)
        traffic = features.get("traffic_density", 0)
        elev = features.get("elevation", 500)

        raw_score = (
            (rainfall / 150.0 * 25.0) +
            (water / 150.0 * 25.0) +
            ((sev / 10.0) * np.exp(-dist / 3.0) * 30.0) +
            (cond / 3.0 * 10.0) +
            (traffic / 100.0 * 10.0)
        )
        final_score = float(np.clip(0.6 * expected_score + 0.4 * raw_score, 0, 100))

        # Get Decision Tree decision path
        node_indicator = self.dt_model.decision_path(X_in)
        leaf_id = self.dt_model.apply(X_in)[0]
        feature = self.dt_model.tree_.feature
        threshold = self.dt_model.tree_.threshold

        path_rules = []
        node_index = node_indicator.indices
        for node_id in node_index:
            if leaf_id == node_id:
                continue
            f_idx = feature[node_id]
            f_name = self.feature_cols[f_idx]
            val = input_data[f_idx]
            thresh = threshold[node_id]
            passed = val <= thresh
            sign = "<=" if passed else ">"
            path_rules.append(f"{f_name} ({val:.1f}) {sign} {thresh:.1f}")

        # Feature importances from Random Forest
        importances = dict(zip(self.feature_cols, [float(x) for x in self.rf_model.feature_importances_]))

        return {
            "risk_score": round(final_score, 1),
            "risk_category": pred_category,
            "confidence": round(confidence * 100.0, 1),
            "decision_path": path_rules,
            "feature_importances": importances
        }

    def get_tree_structure(self) -> dict:
        """
        Returns JSON representation of the trained Decision Tree for UI Decision Tree Lab.
        """
        tree_ = self.dt_model.tree_
        feature_name = [
            self.feature_cols[i] if i != _tree.TREE_UNDEFINED else "undefined!"
            for i in tree_.feature
        ]

        def recurse(node):
            if tree_.feature[node] != _tree.TREE_UNDEFINED:
                name = feature_name[node]
                thresh = float(tree_.threshold[node])
                left = recurse(tree_.children_left[node])
                right = recurse(tree_.children_right[node])
                return {
                    "name": f"{name} <= {thresh:.1f}?",
                    "feature": name,
                    "threshold": round(thresh, 1),
                    "children": [left, right]
                }
            else:
                counts = tree_.value[node][0]
                total = sum(counts)
                pred_idx = np.argmax(counts)
                pred_cat = self.dt_model.classes_[pred_idx]
                conf = float(counts[pred_idx] / total * 100.0) if total > 0 else 100.0
                return {
                    "name": f"Leaf: {pred_cat}",
                    "category": pred_cat,
                    "confidence": round(conf, 1),
                    "samples": int(total)
                }

        return recurse(0)

# Global singleton instance
risk_model_instance = RoadRiskMLModel()
