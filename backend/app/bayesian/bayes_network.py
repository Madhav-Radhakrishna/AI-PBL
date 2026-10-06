import numpy as np

class DisasterBayesianNetwork:
    """
    Bayesian Network for Disaster Uncertainty Reasoning.
    DAG Structure:
      Rainfall, WaterLevel, Elevation -> Flooding
      Flooding, HazardSeverity -> RoadUnsafe

    Unit V: Bayes' Rule, Conditional Independence, Probabilistic Inference.
    """
    def __init__(self):
        # Prior probabilities
        self.priors = {
            "Rainfall": {"LOW": 0.5, "MEDIUM": 0.3, "HIGH": 0.2},
            "WaterLevel": {"LOW": 0.6, "MEDIUM": 0.25, "HIGH": 0.15},
            "Elevation": {"LOW": 0.3, "MEDIUM": 0.5, "HIGH": 0.2},
            "HazardSeverity": {"LOW": 0.5, "MEDIUM": 0.35, "HIGH": 0.15},
        }

    def _get_discrete_state(self, val: float, thresholds: tuple) -> str:
        t1, t2 = thresholds
        if val < t1:
            return "LOW"
        elif val < t2:
            return "MEDIUM"
        else:
            return "HIGH"

    def compute_prob_flooding(self, rainfall_state: str, water_state: str, elevation_state: str) -> float:
        """
        CPT: P(Flooding = True | Rainfall, WaterLevel, Elevation)
        Low elevation + High rainfall + High water level = near 1.0 flood risk.
        """
        rain_w = {"LOW": 0.05, "MEDIUM": 0.35, "HIGH": 0.85}[rainfall_state]
        water_w = {"LOW": 0.05, "MEDIUM": 0.40, "HIGH": 0.90}[water_state]
        elev_w = {"LOW": 0.85, "MEDIUM": 0.30, "HIGH": 0.05}[elevation_state]

        # Combination formula with soft saturating max
        raw_p = (0.45 * rain_w) + (0.45 * water_w) + (0.10 * elev_w)
        # Non-linear boost if both rain and water are HIGH and elevation is LOW
        if rainfall_state == "HIGH" and water_state == "HIGH" and elevation_state == "LOW":
            raw_p = max(raw_p, 0.94)

        return float(np.clip(raw_p, 0.01, 0.99))

    def compute_prob_road_unsafe(self, p_flooding: float, hazard_sev_state: str) -> float:
        """
        CPT: P(RoadUnsafe = True | Flooding, HazardSeverity)
        """
        sev_w = {"LOW": 0.1, "MEDIUM": 0.4, "HIGH": 0.85}[hazard_sev_state]
        p_unsafe = (0.7 * p_flooding) + (0.3 * sev_w)
        return float(np.clip(p_unsafe, 0.01, 0.99))

    def predict(self, evidence: dict) -> dict:
        """
        Input evidence dict:
        {
           "rainfall_mm_hr": 78.0,
           "water_level_cm": 82.0,
           "elevation_m": 490.0,
           "hazard_severity": 8.0
        }
        Returns:
           {
             "prob_flooding": 0.82,
             "prob_road_unsafe": 0.87,
             "prob_road_safe": 0.13,
             "confidence": "High",
             "evidence_discrete": {...},
             "evidence_contributions": [...]
           }
        """
        r_val = evidence.get("rainfall_mm_hr", 20.0)
        w_val = evidence.get("water_level_cm", 15.0)
        e_val = evidence.get("elevation_m", 520.0)
        s_val = evidence.get("hazard_severity", 3.0)

        r_state = self._get_discrete_state(r_val, (25.0, 60.0))
        w_state = self._get_discrete_state(w_val, (30.0, 70.0))
        # For elevation, lower elevation = higher risk category state
        e_state = "LOW" if e_val < 495 else ("MEDIUM" if e_val < 530 else "HIGH")
        s_state = self._get_discrete_state(s_val, (3.5, 7.0))

        p_flooding = self.compute_prob_flooding(r_state, w_state, e_state)
        p_unsafe = self.compute_prob_road_unsafe(p_flooding, s_state)
        p_safe = round(1.0 - p_unsafe, 3)

        # Calculate evidence contributions
        baseline_p = 0.15 # Baseline P(Unsafe) with LOW risk evidence
        diff = max(p_unsafe - baseline_p, 0.01)

        rain_contrib = 0.40 if r_state == "HIGH" else (0.20 if r_state == "MEDIUM" else 0.05)
        water_contrib = 0.35 if w_state == "HIGH" else (0.15 if w_state == "MEDIUM" else 0.05)
        elev_contrib = 0.15 if e_state == "LOW" else 0.05
        sev_contrib = 0.10 if s_state == "HIGH" else (0.05 if s_state == "MEDIUM" else 0.02)

        total_weights = rain_contrib + water_contrib + elev_contrib + sev_contrib

        contributions = [
            {
                "variable": "Rainfall",
                "val": f"{r_val} mm/hr ({r_state})",
                "contribution_pct": round((rain_contrib / total_weights) * 100, 1),
                "impact": "High Risk" if r_state == "HIGH" else "Moderate"
            },
            {
                "variable": "Water Level",
                "val": f"{w_val} cm ({w_state})",
                "contribution_pct": round((water_contrib / total_weights) * 100, 1),
                "impact": "High Risk" if w_state == "HIGH" else "Moderate"
            },
            {
                "variable": "Elevation",
                "val": f"{e_val} m ({e_state})",
                "contribution_pct": round((elev_contrib / total_weights) * 100, 1),
                "impact": "High Risk (Low Land)" if e_state == "LOW" else "Safe (High Land)"
            },
            {
                "variable": "Hazard Severity",
                "val": f"{s_val}/10 ({s_state})",
                "contribution_pct": round((sev_contrib / total_weights) * 100, 1),
                "impact": "Severe" if s_state == "HIGH" else "Normal"
            },
        ]

        confidence = "High" if (p_unsafe > 0.8 or p_unsafe < 0.2) else ("Medium" if (p_unsafe > 0.6 or p_unsafe < 0.4) else "Low")

        return {
            "prob_flooding": round(p_flooding, 3),
            "prob_road_unsafe": round(p_unsafe, 3),
            "prob_road_safe": p_safe,
            "confidence": confidence,
            "evidence_discrete": {
                "Rainfall": r_state,
                "WaterLevel": w_state,
                "Elevation": e_state,
                "HazardSeverity": s_state
            },
            "evidence_contributions": contributions
        }

bayes_net_instance = DisasterBayesianNetwork()
