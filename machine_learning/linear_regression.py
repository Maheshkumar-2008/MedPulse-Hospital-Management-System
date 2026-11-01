"""
Machine Learning Model 1: Linear Regression
Purpose: Estimate hospital Length of Stay (LOS) in days using demographic and clinical features.
Outputs: Actual vs Predicted, MAE, RMSE, R² Score.
Disclaimer: Synthetic data for academic research/educational demonstration only.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class HospitalLengthOfStayModel:
    def __init__(self):
        self.model = LinearRegression()
        self.is_trained = False
        self.metrics = {}
        self.feature_names = ["age", "comorbidity_score", "prior_admissions_count", "systolic_bp", "glucose_level"]

    def train(self, df: pd.DataFrame):
        X = df[self.feature_names].fillna(0)
        y = df["length_of_stay_days"].fillna(2.0)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        # Sample actual vs predicted for frontend plotting
        comparison = []
        for act, prd in zip(y_test[:20], y_pred[:20]):
            comparison.append({
                "actual": round(float(act), 1),
                "predicted": max(1.0, round(float(prd), 1))
            })

        self.metrics = {
            "model_name": "Linear Regression (Length of Stay Estimation)",
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2_score": round(r2, 3),
            "coefficients": {name: round(float(coef), 4) for name, coef in zip(self.feature_names, self.model.coef_)},
            "intercept": round(float(self.model.intercept_), 3),
            "sample_predictions": comparison,
            "disclaimer": "Educational academic demonstration using synthetic patient records."
        }
        self.is_trained = True
        return self.metrics

    def predict(self, sample: dict) -> dict:
        features = pd.DataFrame([{
            "age": sample.get("age", 45),
            "comorbidity_score": sample.get("comorbidity_score", 1),
            "prior_admissions_count": sample.get("prior_admissions_count", 0),
            "systolic_bp": sample.get("systolic_bp", 120),
            "glucose_level": sample.get("glucose_level", 100)
        }])
        predicted_days = float(self.model.predict(features)[0]) if self.is_trained else 3.5
        predicted_days = max(1.0, round(predicted_days, 1))
        
        return {
            "predicted_length_of_stay_days": predicted_days,
            "features_used": sample,
            "interpretation": f"Estimated stay duration is approximately {predicted_days} days based on comorbidity and baseline vitals."
        }

los_model = HospitalLengthOfStayModel()
