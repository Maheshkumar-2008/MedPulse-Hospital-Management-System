"""
Python Data Analysis Module: Admissions, Discharges & Length of Stay (ALOS) Analysis.
Calculates inpatient duration, bed turnover, and monthly admission dynamics.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

class AdmissionAnalyzer:
    def __init__(self):
        pass

    def analyze_admissions(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculates ALOS, readmission metrics, and stay duration distributions."""
        if len(df) == 0:
            return {}

        los_metrics = {}
        if "length_of_stay_days" in df.columns:
            los = df["length_of_stay_days"].dropna()
            los_metrics = {
                "average_length_of_stay": round(float(los.mean()), 2),
                "median_length_of_stay": round(float(los.median()), 2),
                "min_stay_days": round(float(los.min()), 1),
                "max_stay_days": round(float(los.max()), 1),
                "std_stay_days": round(float(los.std()), 2)
            }

        # Readmission rate
        readmission_rate = 0.0
        if "readmitted_30_days" in df.columns:
            readmission_rate = round(float(df["readmitted_30_days"].mean()) * 100, 2)

        # Department vs ALOS
        dept_alos = {}
        if "department" in df.columns and "length_of_stay_days" in df.columns:
            dept_alos = df.groupby("department")["length_of_stay_days"].mean().round(2).to_dict()

        return {
            "alos_metrics": los_metrics,
            "readmission_30d_rate_pct": readmission_rate,
            "department_average_stay_days": dept_alos
        }

admission_analyzer = AdmissionAnalyzer()
