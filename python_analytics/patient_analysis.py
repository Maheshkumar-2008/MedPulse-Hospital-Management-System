"""
Python Data Analysis Module: Patient Demographic and Descriptive Statistical Analysis.
Calculates summary statistics, age-group classification, gender ratios, and patient status metrics.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

class PatientStatisticalAnalyzer:
    def __init__(self):
        pass

    def compute_demographics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculates demographic ratios, age distributions, and central tendencies."""
        total = len(df)
        if total == 0:
            return {}

        # Age Statistics
        age_series = df["age"].dropna()
        age_stats = {
            "mean_age": round(float(age_series.mean()), 2),
            "median_age": round(float(age_series.median()), 2),
            "std_age": round(float(age_series.std()), 2),
            "min_age": int(age_series.min()),
            "max_age": int(age_series.max()),
            "iqr_age": round(float(age_series.quantile(0.75) - age_series.quantile(0.25)), 2)
        }

        # Gender Distribution
        gender_counts = df["gender"].value_counts().to_dict()
        gender_pct = {k: round(v / total * 100, 2) for k, v in gender_counts.items()}

        # Age Group Distribution
        if "age_group" not in df.columns:
            df["age_group"] = pd.cut(
                df["age"],
                bins=[0, 17, 35, 60, 120],
                labels=["Pediatric (0-17)", "Young Adult (18-35)", "Middle Aged (36-60)", "Senior (61+)"]
            )
        age_group_counts = df["age_group"].value_counts().to_dict()

        # Blood Group Distribution
        blood_counts = df["blood_group"].value_counts().to_dict() if "blood_group" in df.columns else {}

        # Patient Status Distribution
        status_counts = df["current_status"].value_counts().to_dict() if "current_status" in df.columns else {}

        return {
            "total_patient_sample": total,
            "age_statistics": age_stats,
            "gender_counts": gender_counts,
            "gender_percentages": gender_pct,
            "age_groups": age_group_counts,
            "blood_group_counts": blood_counts,
            "patient_status_counts": status_counts
        }

patient_analyzer = PatientStatisticalAnalyzer()
