"""
Machine Learning Model 2: Logistic Regression
Purpose: Classify 30-Day Hospital Readmission Risk (High Risk vs Low Risk).
Outputs: Class prediction, probability estimates, confusion matrix, accuracy, precision, recall, F1 score.
Disclaimer: Synthetic data for academic research/educational demonstration only.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

class ReadmissionRiskLogisticModel:
    def __init__(self):
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.is_trained = False
        self.metrics = {}
        self.feature_names = ["age", "comorbidity_score", "prior_admissions_count", "length_of_stay_days", "systolic_bp", "glucose_level", "bmi"]

    def train(self, df: pd.DataFrame):
        X = df[self.feature_names].fillna(0)
        y = df["readmitted_30_days"].fillna(0).astype(int)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        cm = confusion_matrix(y_test, y_pred).tolist()

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        self.metrics = {
            "model_name": "Logistic Regression (30-Day Readmission Risk)",
            "accuracy": round(acc, 3),
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1_score": round(f1, 3),
            "confusion_matrix": cm,
            "confusion_matrix_labels": ["Not Readmitted", "Readmitted"],
            "disclaimer": "Educational academic demonstration using synthetic patient records."
        }
        self.is_trained = True
        return self.metrics

    def predict(self, sample: dict) -> dict:
        features = pd.DataFrame([{
            "age": sample.get("age", 50),
            "comorbidity_score": sample.get("comorbidity_score", 1),
            "prior_admissions_count": sample.get("prior_admissions_count", 0),
            "length_of_stay_days": sample.get("length_of_stay_days", 3.0),
            "systolic_bp": sample.get("systolic_bp", 125),
            "glucose_level": sample.get("glucose_level", 110),
            "bmi": sample.get("bmi", 24.5)
        }])
        
        if self.is_trained:
            probs = self.model.predict_proba(features)[0]
            pred_class = int(self.model.predict(features)[0])
            prob_readmission = float(probs[1])
            prob_low_risk = float(probs[0])
        else:
            prob_readmission = 0.28
            prob_low_risk = 0.72
            pred_class = 0

        risk_category = "High Readmission Risk" if pred_class == 1 else "Low Readmission Risk"
        return {
            "predicted_class": pred_class,
            "risk_label": risk_category,
            "probability_readmission": round(prob_readmission * 100, 2),
            "probability_safe": round(prob_low_risk * 100, 2),
            "recommendation": "Enhanced post-discharge transitional care recommended." if pred_class == 1 else "Standard routine outpatient follow-up scheduled."
        }

logistic_model = ReadmissionRiskLogisticModel()
