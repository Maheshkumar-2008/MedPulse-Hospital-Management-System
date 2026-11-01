"""
Machine Learning Model 5: K-Means Clustering
Purpose: Unsupervised segmentation of patients based on demographics, stay length, and vitals.
Outputs: Patient clusters, cluster centers, cluster statistics, and 2D/3D PCA visualization data.
Disclaimer: Synthetic data for academic research/educational demonstration only.
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

class PatientKMeansClusteringModel:
    def __init__(self, n_clusters=4):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.pca = PCA(n_components=2)
        self.is_trained = False
        self.metrics = {}
        self.feature_names = ["age", "bmi", "systolic_bp", "glucose_level", "length_of_stay_days"]

    def train(self, df: pd.DataFrame):
        X = df[self.feature_names].fillna(0)
        X_scaled = self.scaler.fit_transform(X)

        cluster_labels = self.model.fit_predict(X_scaled)
        pca_coords = self.pca.fit_transform(X_scaled)

        df_copy = df.copy()
        df_copy["cluster"] = cluster_labels
        df_copy["pca_x"] = pca_coords[:, 0]
        df_copy["pca_y"] = pca_coords[:, 1]

        # Calculate cluster statistics and archetypes
        cluster_summaries = []
        cluster_names = [
            "Young / Low-Acuity Outpatients",
            "Elderly High-Risk Chronic Care",
            "Metabolic / Hypertensive Inpatients",
            "Moderate Acute Medical-Surgical"
        ]

        for c_id in range(self.n_clusters):
            c_data = df_copy[df_copy["cluster"] == c_id]
            summary = {
                "cluster_id": c_id,
                "cluster_title": cluster_names[c_id % len(cluster_names)],
                "patient_count": int(len(c_data)),
                "avg_age": round(float(c_data["age"].mean()), 1),
                "avg_bmi": round(float(c_data["bmi"].mean()), 1),
                "avg_systolic_bp": round(float(c_data["systolic_bp"].mean()), 1),
                "avg_glucose": round(float(c_data["glucose_level"].mean()), 1),
                "avg_stay_days": round(float(c_data["length_of_stay_days"].mean()), 1),
            }
            cluster_summaries.append(summary)

        # 2D coordinates sample for scatter plot visualization
        plot_points = []
        for _, row in df_copy.head(100).iterrows():
            plot_points.append({
                "patient_id": row.get("patient_id", ""),
                "x": round(float(row["pca_x"]), 3),
                "y": round(float(row["pca_y"]), 3),
                "cluster": int(row["cluster"]),
                "cluster_title": cluster_names[int(row["cluster"]) % len(cluster_names)],
                "age": int(row["age"]),
                "los": float(row["length_of_stay_days"])
            })

        self.metrics = {
            "model_name": "K-Means Clustering (Patient Cohort Segmentation)",
            "n_clusters": self.n_clusters,
            "inertia": round(float(self.model.inertia_), 2),
            "cluster_summaries": cluster_summaries,
            "visualization_points": plot_points,
            "pca_explained_variance_ratio": [round(float(v), 4) for v in self.pca.explained_variance_ratio_],
            "disclaimer": "Educational academic demonstration using synthetic patient records."
        }
        self.is_trained = True
        return self.metrics

    def predict(self, sample: dict) -> dict:
        features = pd.DataFrame([{
            "age": sample.get("age", 50),
            "bmi": sample.get("bmi", 24.5),
            "systolic_bp": sample.get("vital_systolic_bp", sample.get("systolic_bp", 125)),
            "glucose_level": sample.get("vital_glucose", sample.get("glucose_level", 110)),
            "length_of_stay_days": sample.get("length_of_stay_days", 3.0)
        }])
        if self.is_trained:
            scaled = self.scaler.transform(features)
            c_id = int(self.model.predict(scaled)[0])
        else:
            c_id = 0
        names = [
            "Young / Low-Acuity Outpatients",
            "Elderly High-Risk Chronic Care",
            "Metabolic / Hypertensive Inpatients",
            "Moderate Acute Medical-Surgical"
        ]
        return {
            "cluster_id": c_id,
            "cluster_name": names[c_id % len(names)]
        }

kmeans_model = PatientKMeansClusteringModel()
