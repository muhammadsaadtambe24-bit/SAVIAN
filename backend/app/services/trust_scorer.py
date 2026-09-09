import math
try:
    import numpy as np
except ImportError:
    np = None

class TrustWeightedScorer:
    """
    Computes trust-weighted scoring and failure risk curves using sensor confidence fusion
    (TMS Track Recording Cars, SMMS OHE inspection, TDMS Axle counter records).
    """

    @staticmethod
    def calculate_trust(
        past_punctuality_ratio: float = 0.95,
        machine_readiness: float = 0.92,
        sensor_confidence: float = 0.94,
        historical_overrun_penalty: float = 0.05
    ) -> float:
        # Weighted sensor and operational fusion
        weights = [0.35, 0.35, 0.30]
        factors = [past_punctuality_ratio, machine_readiness, sensor_confidence]
        
        if np is not None:
            raw_score = float(np.dot(weights, factors))
        else:
            raw_score = sum(w * f for w, f in zip(weights, factors))
            
        score = max(50.0, min(100.0, (raw_score - historical_overrun_penalty) * 100.0))
        return round(score, 1)

    @staticmethod
    def compute_risk_curve(duration_minutes: int, trust_score: float) -> dict:
        """
        Computes exponential overrun failure probability curve based on block length and trust score.
        """
        decay_lambda = (100.0 - trust_score) / 1000.0
        p_overrun = 1.0 - math.exp(-decay_lambda * (duration_minutes / 60.0))
        
        return {
            "overrun_probability_pct": round(p_overrun * 100, 2),
            "safety_margin_minutes": round(duration_minutes * 0.15),
            "kavach_monitoring_tier": "SIL-4 ENHANCED" if p_overrun > 0.2 else "SIL-4 STANDARD"
        }
