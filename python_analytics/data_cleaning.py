"""
Python Data Analysis Module: Data Cleaning and Preprocessing.
Demonstrates missing value imputation, duplicate removal, normalization, and transformation.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

class HospitalDataCleaner:
    def __init__(self):
        pass

    def clean_patient_dataset(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans raw patient dataset:
        1. Identifies and removes duplicate rows
        2. Detects missing values and applies median/mode imputation
        3. Formats dates and derives patient age groups
        4. Standardizes gender and blood group values
        """
        initial_rows = len(df)
        audit_log = {
            "initial_record_count": initial_rows,
            "duplicates_removed": 0,
            "missing_values_imputed": {},
            "columns_processed": list(df.columns)
        }

        # 1. Remove duplicates
        df_cleaned = df.drop_duplicates(subset=["patient_id"] if "patient_id" in df.columns else None).copy()
        audit_log["duplicates_removed"] = initial_rows - len(df_cleaned)

        # 2. Missing value detection & imputation
        for col in df_cleaned.columns:
            null_count = int(df_cleaned[col].isnull().sum())
            if null_count > 0:
                audit_log["missing_values_imputed"][col] = null_count
                if pd.api.types.is_numeric_dtype(df_cleaned[col]):
                    median_val = df_cleaned[col].median()
                    df_cleaned[col] = df_cleaned[col].fillna(median_val)
                else:
                    mode_val = df_cleaned[col].mode()[0] if not df_cleaned[col].mode().empty else "Unknown"
                    df_cleaned[col] = df_cleaned[col].fillna(mode_val)

        # 3. Derive Age Groups
        if "age" in df_cleaned.columns:
            df_cleaned["age_group"] = pd.cut(
                df_cleaned["age"],
                bins=[0, 17, 35, 60, 120],
                labels=["Pediatric (0-17)", "Young Adult (18-35)", "Middle Aged (36-60)", "Senior (61+)"],
                right=True
            )

        # 4. Standardize text fields
        if "gender" in df_cleaned.columns:
            df_cleaned["gender"] = df_cleaned["gender"].astype(str).str.strip().str.capitalize()
            
        if "blood_group" in df_cleaned.columns:
            df_cleaned["blood_group"] = df_cleaned["blood_group"].astype(str).str.strip().str.upper()

        audit_log["final_record_count"] = len(df_cleaned)
        return df_cleaned, audit_log

cleaner = HospitalDataCleaner()
