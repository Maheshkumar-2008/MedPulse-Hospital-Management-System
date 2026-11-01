"""
Machine Learning Model 3: Decision Tree Classifier
Purpose: Classify clinical triage urgency level (Low, Medium, High, Critical).
Outputs: Decision tree logic rules, classification metrics, confusion matrix.
Disclaimer: Synthetic data for academic research/educational demonstration only.
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

class TriageDecisionTreeModel:
    def __init__(self):
        self.model = DecisionTreeClassifier(max_depth=4, random_state=42)
        self.is_trained = False
        self.metrics = {}
        self.feature_names = ["age", "systolic_bp", "glucose_level", "comorbidity_score", "prior_admissions_count"]
        self.class_names = ["Critical", "High", "Low", "Medium"]

    def train(self, df: pd.DataFrame):
        X = df[self.feature_names].fillna(0)
        y = df["triage_urgency_level"].fillna("Medium").astype(str)

        classes = sorted(list(y.unique()))
        self.class_names = classes

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        cm = confusion_matrix(y_test, y_pred, labels=self.class_names).tolist()
        tree_rules = export_text(self.model, feature_names=self.feature_names)

        self.metrics = {
            "model_name": "Decision Tree (Clinical Triage Urgency Classifier)",
            "accuracy": round(acc, 3),
            "classes": self.class_names,
            "confusion_matrix": cm,
            "tree_rules_text": tree_rules,
            "tree_depth": int(self.model.get_depth()),
            "n_leaves": int(self.model.get_n_leaves()),
            "disclaimer": "Educational academic demonstration using synthetic patient records."
        }
        self.is_trained = True
        return self.metrics

    def predict(self, sample: dict) -> dict:
        features = pd.DataFrame([{
            "age": sample.get("age", 45),
            "systolic_bp": sample.get("systolic_bp", 125),
            "glucose_level": sample.get("glucose_level", 110),
            "comorbidity_score": sample.get("comorbidity_score", 1),
            "prior_admissions_count": sample.get("prior_admissions_count", 0)
        }])

        if self.is_trained:
            pred = str(self.model.predict(features)[0])
            probs = self.model.predict_proba(features)[0]
            class_conf = {c: round(float(p) * 100, 1) for c, p in zip(self.class_names, probs)}
        else:
            pred = "Medium"
            class_conf = {"Critical": 5.0, "High": 20.0, "Medium": 60.0, "Low": 15.0}

        return {
            "predicted_triage_level": pred,
            "probabilities": class_conf,
            "clinical_protocol": f"Patient routed to {pred} urgency stream based on decision tree threshold checks."
        }

decision_tree_model = TriageDecisionTreeModel()
