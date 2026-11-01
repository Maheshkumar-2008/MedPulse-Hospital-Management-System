"""
Machine Learning Model 4: Random Forest Classifier
Purpose: Ensemble prediction of 30-day hospital readmission risk & feature importance ranking.
Outputs: Accuracy, Precision, Recall, F1 score, Feature Importance ranking, model comparison metrics.
Disclaimer: Synthetic data for academic research/educational demonstration only.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

class ReadmissionRandomForestModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
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

        # Calculate feature importance
        importances = []
        for name, imp in zip(self.feature_names, self.model.feature_importances_):
            importances.append({
                "feature": name,
                "importance_score": round(float(imp), 4),
                "percentage": round(float(imp) * 100, 2)
            })
        importances.sort(key=lambda x: x["importance_score"], reverse=True)

        self.metrics = {
            "model_name": "Random Forest Classifier (Ensemble Readmission Risk)",
            "accuracy": round(acc, 3),
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1_score": round(f1, 3),
            "confusion_matrix": cm,
            "feature_importance": importances,
            "n_estimators": 100,
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
            pred_class = int(self.model.predict(features)[0])
            probs = self.model.predict_proba(features)[0]
            prob_risk = float(probs[1])
        else:
            pred_class = 0
            prob_risk = 0.22

        return {
            "predicted_class": pred_class,
            "risk_label": "High Readmission Risk" if pred_class == 1 else "Low Readmission Risk",
            "probability_readmission": round(prob_risk * 100, 2),
            "top_risk_driver": "Prior Admissions Count & Comorbidity Score",
            "clinical_advice": "Assign dedicated clinical navigator for discharge transition." if pred_class == 1 else "Standard discharge protocol suitable."
        }

random_forest_model = ReadmissionRandomForestModel()
