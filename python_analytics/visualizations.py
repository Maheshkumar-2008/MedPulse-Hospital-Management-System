"""
Python Visualizations Module: Plotly, Seaborn & Matplotlib Generators.
Creates publication-quality charts for hospital analytics reports and Streamlit dashboard.
"""

import matplotlib
matplotlib.use("Agg")  # Headless backend
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import io
import base64

class HospitalVisualizer:
    def __init__(self):
        # Set healthcare blue palette
        sns.set_theme(style="whitegrid")
        self.primary_blue = "#0284c7"
        self.dark_blue = "#0369a1"
        self.light_blue = "#e0f2fe"

    def plot_gender_pie(self, df: pd.DataFrame):
        fig = px.pie(
            df, names="gender", title="Patient Gender Distribution",
            color_discrete_sequence=["#0284c7", "#f43f5e", "#94a3b8"],
            hole=0.4
        )
        fig.update_layout(template="plotly_white")
        return fig

    def plot_age_distribution_histogram(self, df: pd.DataFrame):
        fig = px.histogram(
            df, x="age", nbins=20, title="Patient Age Demographics Distribution",
            color_discrete_sequence=["#0284c7"], marginal="box"
        )
        fig.update_layout(template="plotly_white", xaxis_title="Age (Years)", yaxis_title="Patient Frequency")
        return fig

    def plot_top_diseases_bar(self, df: pd.DataFrame):
        top_diseases = df["primary_diagnosis"].value_counts().head(8).reset_index()
        top_diseases.columns = ["Disease", "Count"]
        fig = px.bar(
            top_diseases, x="Count", y="Disease", orientation="h",
            title="Top Clinical Diagnoses Incidence",
            color="Count", color_continuous_scale="Blues"
        )
        fig.update_layout(template="plotly_white", yaxis=dict(autorange="reversed"))
        return fig

    def plot_department_patient_distribution(self, df: pd.DataFrame):
        dept_counts = df["department"].value_counts().reset_index()
        dept_counts.columns = ["Department", "Patients"]
        fig = px.bar(
            dept_counts, x="Department", y="Patients",
            title="Department-wise Patient Caseload Distribution",
            color="Patients", color_continuous_scale="Blues"
        )
        fig.update_layout(template="plotly_white", xaxis_tickangle=-45)
        return fig

    def plot_status_pie(self, df: pd.DataFrame):
        status_counts = df["current_status"].value_counts().reset_index()
        status_counts.columns = ["Status", "Count"]
        colors_map = {
            "Registered": "#64748b",
            "Waiting for Consultation": "#f59e0b",
            "Under Consultation": "#0284c7",
            "Under Treatment": "#2563eb",
            "Admitted": "#1e3a8a",
            "Under Observation": "#9333ea",
            "Emergency": "#dc2626",
            "Discharged": "#16a34a",
            "Referred to Another Hospital": "#0d9488",
            "Deceased": "#1f2937"
        }
        fig = px.pie(
            status_counts, names="Status", values="Count",
            title="Live Patient Status Tracking Breakdown",
            color="Status", color_discrete_map=colors_map,
            hole=0.45
        )
        fig.update_layout(template="plotly_white")
        return fig

    def plot_length_of_stay_box(self, df: pd.DataFrame):
        fig = px.box(
            df, x="department", y="length_of_stay_days",
            title="Length of Stay (Days) by Clinical Department",
            color="department", color_discrete_sequence=px.colors.qualitative.Prism
        )
        fig.update_layout(template="plotly_white", xaxis_tickangle=-45)
        return fig

visualizer = HospitalVisualizer()
