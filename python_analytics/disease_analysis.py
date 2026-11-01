"""
Python Data Analysis Module: Disease and Department Pathology Analytics.
Evaluates disease incidence, department caseloads, and diagnostic patterns.
"""

import pandas as pd
from typing import Dict, Any

class DiseaseAnalyzer:
    def __init__(self):
        pass

    def analyze_diseases_and_departments(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculates disease frequencies, department distribution, and cross-tabulations."""
        total = len(df)
        if total == 0:
            return {}

        # Top Diseases
        disease_counts = df["primary_diagnosis"].value_counts().head(10).to_dict() if "primary_diagnosis" in df.columns else {}

        # Department Distribution
        dept_counts = df["department"].value_counts().to_dict() if "department" in df.columns else {}

        # Cross Tabulation: Department vs Top Diagnoses
        crosstab_dict = {}
        if "department" in df.columns and "primary_diagnosis" in df.columns:
            ct = pd.crosstab(df["department"], df["primary_diagnosis"])
            crosstab_dict = {col: ct[col].to_dict() for col in ct.columns[:6]}

        return {
            "top_diseases": disease_counts,
            "department_caseload": dept_counts,
            "department_disease_matrix": crosstab_dict
        }

disease_analyzer = DiseaseAnalyzer()
