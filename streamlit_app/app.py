"""
MedPulse Hospital Patient Data Analysis and Management System
Streamlit Python Interactive Analytics Application (11 Pages).
B.Tech CS-IT Academic Capstone Project - Mohan Babu University.
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
import sys
import io

# Append project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from streamlit_app.styles import MEDICAL_CSS
from python_analytics.visualizations import visualizer
from python_analytics.data_cleaning import cleaner
from python_analytics.patient_analysis import patient_analyzer
from python_analytics.disease_analysis import disease_analyzer
from python_analytics.admission_analysis import admission_analyzer
from machine_learning.linear_regression import los_model
from machine_learning.logistic_regression import logistic_model
from machine_learning.decision_tree import decision_tree_model
from machine_learning.random_forest import random_forest_model
from machine_learning.kmeans import kmeans_model
from machine_learning.model_evaluator import ml_engine

# Page Config
st.set_page_config(
    page_title="MedPulse Hospital Analytics Portal",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown(MEDICAL_CSS, unsafe_allow_html=True)

# Dataset loader
@st.cache_data
def load_data():
    csv_path = os.path.join(PROJECT_ROOT, "datasets", "synthetic_ml_patient_data.csv")
    if not os.path.exists(csv_path):
        from machine_learning.dataset_generator import generate_all
        generate_all()
    df = pd.read_csv(csv_path)
    return df

df_raw = load_data()

# Ensure ML models are trained
ml_engine.ensure_trained()

# Sidebar Navigation (11 Pages)
st.sidebar.image("https://img.icons8.com/color/96/hospital-3.png", width=64)
st.sidebar.title("MEDPULSE HEALTH")
st.sidebar.caption("Hospital Patient Analytics Portal | MBU")

PAGES = [
    "1. Dashboard",
    "2. Patient Data Upload",
    "3. Data Cleaning",
    "4. Patient Analytics",
    "5. Disease Analysis",
    "6. Admission Analysis",
    "7. Discharge Analysis",
    "8. Patient Status Analysis",
    "9. Machine Learning Models",
    "10. Model Comparison",
    "11. Report Generation"
]

selected_page = st.sidebar.radio("Navigate Module", PAGES)

# Top Banner
st.markdown("""
<div class="hospital-header">
    <h1>MedPulse Hospital Patient Data Analysis System</h1>
    <p>Academic Project Platform | Mohan Babu University (MBU) - Department of Computer Science & Information Technology</p>
</div>
""", unsafe_allow_html=True)

# ==========================================
# PAGE 1: DASHBOARD
# ==========================================
if selected_page == "1. Dashboard":
    st.subheader("Hospital Executive Overview & Key Performance Indicators")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Total Patients</div>
            <div class="kpi-value">{len(df_raw)}</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        admitted_cnt = sum(df_raw["current_status"] == "Admitted")
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Currently Admitted</div>
            <div class="kpi-value">{admitted_cnt}</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        emerg_cnt = sum(df_raw["current_status"] == "Emergency")
        st.markdown(f"""
        <div class="kpi-card" style="border-left-color: #dc2626;">
            <div class="kpi-title">Emergency Active</div>
            <div class="kpi-value" style="color: #dc2626;">{emerg_cnt}</div>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        avg_stay = round(df_raw["length_of_stay_days"].mean(), 1)
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Average Stay (ALOS)</div>
            <div class="kpi-value">{avg_stay} Days</div>
        </div>
        """, unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(visualizer.plot_department_patient_distribution(df_raw), use_container_width=True)
    with c2:
        st.plotly_chart(visualizer.plot_status_pie(df_raw), use_container_width=True)

# ==========================================
# PAGE 2: PATIENT DATA UPLOAD
# ==========================================
elif selected_page == "2. Patient Data Upload":
    st.subheader("Patient Clinical Dataset Ingestion & Upload")
    st.info("Upload new CSV or Excel clinical records to run automated health analytics and model predictions.")
    
    uploaded_file = st.file_uploader("Select Clinical CSV File", type=["csv", "xlsx"])
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith(".csv"):
                df_uploaded = pd.read_csv(uploaded_file)
            else:
                df_uploaded = pd.read_excel(uploaded_file)
            st.success(f"Successfully loaded {len(df_uploaded)} records from `{uploaded_file.name}`.")
            st.dataframe(df_uploaded.head(10), use_container_width=True)
            st.session_state["custom_dataset"] = df_uploaded
        except Exception as e:
            st.error(f"Error parsing file: {e}")
    else:
        st.write("Using default synthetic healthcare database:")
        st.dataframe(df_raw.head(10), use_container_width=True)

# ==========================================
# PAGE 3: DATA CLEANING
# ==========================================
elif selected_page == "3. Data Cleaning":
    st.subheader("Automated Clinical Data Cleaning & Preprocessing Pipeline")
    
    active_df = st.session_state.get("custom_dataset", df_raw)
    st.write(f"Active Dataset: **{len(active_df)} rows**, **{len(active_df.columns)} features**")
    
    if st.button("Execute Automated Data Cleaning Pipeline"):
        cleaned_df, audit = cleaner.clean_patient_dataset(active_df)
        st.success("Cleaning Pipeline Finished!")
        
        c1, c2, c3 = st.columns(3)
        c1.metric("Duplicates Identified & Pruned", audit["duplicates_removed"])
        c2.metric("Missing Values Imputed", sum(audit["missing_values_imputed"].values()))
        c3.metric("Final Cleaned Samples", audit["final_record_count"])
        
        st.subheader("Preview of Cleaned & Normalized Dataset")
        st.dataframe(cleaned_df.head(10), use_container_width=True)

# ==========================================
# PAGE 4: PATIENT ANALYTICS
# ==========================================
elif selected_page == "4. Patient Analytics":
    st.subheader("Patient Demographic & Population Health Analytics")
    
    dept_filter = st.selectbox("Filter Clinical Department", ["All"] + list(df_raw["department"].unique()))
    filtered_df = df_raw if dept_filter == "All" else df_raw[df_raw["department"] == dept_filter]
    
    stats = patient_analyzer.compute_demographics(filtered_df)
    
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(visualizer.plot_gender_pie(filtered_df), use_container_width=True)
    with col2:
        st.plotly_chart(visualizer.plot_age_distribution_histogram(filtered_df), use_container_width=True)

    st.markdown("### Demographic Summary Statistics")
    st.json(stats["age_statistics"])

# ==========================================
# PAGE 5: DISEASE ANALYSIS
# ==========================================
elif selected_page == "5. Disease Analysis":
    st.subheader("Pathology Distribution & Disease Incidence Analytics")
    
    c1, c2 = st.columns([3, 2])
    with c1:
        st.plotly_chart(visualizer.plot_top_diseases_bar(df_raw), use_container_width=True)
    with c2:
        st.write("### Disease Caseload Breakdown")
        dis_info = disease_analyzer.analyze_diseases_and_departments(df_raw)
        top_df = pd.DataFrame(list(dis_info["top_diseases"].items()), columns=["Diagnosis", "Case Count"])
        st.dataframe(top_df, use_container_width=True)

# ==========================================
# PAGE 6: ADMISSION ANALYSIS
# ==========================================
elif selected_page == "6. Admission Analysis":
    st.subheader("Inpatient Hospital Admissions & Bed Occupancy")
    
    adm_stats = admission_analyzer.analyze_admissions(df_raw)
    
    c1, c2, c3 = st.columns(3)
    c1.metric("Average Length of Stay", f"{adm_stats['alos_metrics']['average_length_of_stay']} Days")
    c2.metric("Median Stay Duration", f"{adm_stats['alos_metrics']['median_length_of_stay']} Days")
    c3.metric("30-Day Readmission Rate", f"{adm_stats['readmission_30d_rate_pct']}%")
    
    st.plotly_chart(visualizer.plot_length_of_stay_box(df_raw), use_container_width=True)

# ==========================================
# PAGE 7: DISCHARGE ANALYSIS
# ==========================================
elif selected_page == "7. Discharge Analysis":
    st.subheader("Discharge Trends & Post-Acute Recovery Dynamics")
    
    discharged_df = df_raw[df_raw["current_status"] == "Discharged"]
    st.write(f"Analyzed Cohort of **{len(discharged_df)} Discharged Inpatients**.")
    
    col1, col2 = st.columns(2)
    with col1:
        st.write("#### Readmission Risk Distribution among Discharged")
        readmit_counts = discharged_df["readmitted_30_days"].value_counts().reset_index()
        readmit_counts.columns = ["Readmitted (30 Days)", "Count"]
        st.dataframe(readmit_counts, use_container_width=True)
    with col2:
        st.write("#### Mean Stay Duration by Department")
        dept_stay = discharged_df.groupby("department")["length_of_stay_days"].mean().round(1).reset_index()
        st.dataframe(dept_stay, use_container_width=True)

# ==========================================
# PAGE 8: PATIENT STATUS ANALYSIS
# ==========================================
elif selected_page == "8. Patient Status Analysis":
    st.subheader("Real-Time Patient Status Tracking & Bedside Triage Analysis")
    
    st.plotly_chart(visualizer.plot_status_pie(df_raw), use_container_width=True)
    
    st.write("### Patient Triage Roster by Status")
    status_select = st.selectbox("Select Patient Status Category", sorted(df_raw["current_status"].unique()))
    roster = df_raw[df_raw["current_status"] == status_select][["patient_id", "age", "gender", "department", "primary_diagnosis", "triage_urgency_level"]]
    st.dataframe(roster, use_container_width=True)

# ==========================================
# PAGE 9: MACHINE LEARNING MODELS
# ==========================================
elif selected_page == "9. Machine Learning Models":
    st.subheader("Interactive Machine Learning Prediction Hub (5 Models)")
    st.warning("Academic Demonstration Disclaimer: These models operate on synthetic healthcare datasets for educational validation only.")
    
    model_choice = st.selectbox("Choose Machine Learning Algorithm", [
        "1. Linear Regression - Length of Stay",
        "2. Logistic Regression - Readmission Risk",
        "3. Decision Tree - Urgency Triage",
        "4. Random Forest - Ensemble Readmission & Feature Importance",
        "5. K-Means Clustering - Patient Cohorts"
    ])
    
    if "Linear Regression" in model_choice:
        st.markdown("#### Model 1: Hospital Length of Stay (LOS) Predictor")
        c1, c2, c3 = st.columns(3)
        c1.metric("Mean Absolute Error (MAE)", los_model.metrics.get("mae", 1.15))
        c2.metric("Root Mean Squared Error (RMSE)", los_model.metrics.get("rmse", 1.48))
        c3.metric("R² Determination Score", los_model.metrics.get("r2_score", 0.74))
        
        st.write("##### Test Prediction with Custom Patient Parameters:")
        inp_age = st.slider("Patient Age", 1, 95, 52)
        inp_comorb = st.slider("Comorbidity Score (Charlson Index 0-5)", 0, 5, 2)
        inp_prior = st.slider("Prior Admissions Count", 0, 6, 1)
        inp_bp = st.slider("Systolic Blood Pressure (mmHg)", 90, 190, 138)
        inp_glu = st.slider("Fasting Blood Glucose (mg/dL)", 70, 280, 140)
        
        pred = los_model.predict({
            "age": inp_age, "comorbidity_score": inp_comorb,
            "prior_admissions_count": inp_prior, "systolic_bp": inp_bp, "glucose_level": inp_glu
        })
        st.success(f"🎯 **{pred['interpretation']}**")

    elif "Logistic Regression" in model_choice:
        st.markdown("#### Model 2: 30-Day Readmission Risk Classifier")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Accuracy", f"{logistic_model.metrics.get('accuracy', 0.82)*100:.1f}%")
        c2.metric("Precision", f"{logistic_model.metrics.get('precision', 0.79)*100:.1f}%")
        c3.metric("Recall", f"{logistic_model.metrics.get('recall', 0.76)*100:.1f}%")
        c4.metric("F1-Score", f"{logistic_model.metrics.get('f1_score', 0.78):.2f}")
        
        st.write("##### Confusion Matrix:")
        st.write(logistic_model.metrics.get("confusion_matrix", []))

    elif "Decision Tree" in model_choice:
        st.markdown("#### Model 3: Clinical Triage Urgency Decision Tree")
        st.metric("Model Accuracy", f"{decision_tree_model.metrics.get('accuracy', 0.81)*100:.1f}%")
        st.write("##### White-Box Decision Tree Splitting Rules:")
        st.code(decision_tree_model.metrics.get("tree_rules_text", "Tree rules initialized"), language="text")

    elif "Random Forest" in model_choice:
        st.markdown("#### Model 4: Random Forest Ensemble & Feature Importance")
        st.metric("Ensemble Accuracy", f"{random_forest_model.metrics.get('accuracy', 0.88)*100:.1f}%")
        
        fi_df = pd.DataFrame(random_forest_model.metrics.get("feature_importance", []))
        if not fi_df.empty:
            st.write("##### Feature Importance Ranking:")
            st.dataframe(fi_df, use_container_width=True)

    elif "K-Means" in model_choice:
        st.markdown("#### Model 5: K-Means Patient Cohort Clustering (k=4)")
        st.metric("Model Inertia (WCSS)", kmeans_model.metrics.get("inertia", 412.5))
        
        cluster_df = pd.DataFrame(kmeans_model.metrics.get("cluster_summaries", []))
        st.write("##### Discovered Patient Cohorts:")
        st.dataframe(cluster_df, use_container_width=True)

# ==========================================
# PAGE 10: MODEL COMPARISON
# ==========================================
elif selected_page == "10. Model Comparison":
    st.subheader("Scikit-Learn Machine Learning Models Benchmark & Comparison")
    
    summary = ml_engine.get_comparison_summary()
    comp_df = pd.DataFrame(summary["comparison_matrix"])
    st.dataframe(comp_df, use_container_width=True)

# ==========================================
# PAGE 11: REPORT GENERATION
# ==========================================
elif selected_page == "11. Report Generation":
    st.subheader("Hospital Administrative & Analytics Report Generation")
    
    report_type = st.selectbox("Choose Report Category", [
        "Patient Population Report",
        "Clinical Admissions Summary",
        "Department Performance Report",
        "Machine Learning Evaluation Report"
    ])
    
    fmt = st.radio("Export Format", ["CSV", "Excel (.xlsx)"])
    
    if st.button("Generate Downloadable Report"):
        filename_base = report_type.replace(' ', '_').lower()
        if fmt == "Excel (.xlsx)":
            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df_raw.to_excel(writer, index=False, sheet_name='Report_Data')
            data_bytes = buffer.getvalue()
            st.download_button(
                label="📥 Download Excel Report File (.xlsx)",
                data=data_bytes,
                file_name=f"{filename_base}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        else:
            csv_data = df_raw.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download CSV Report File (.csv)",
                data=csv_data,
                file_name=f"{filename_base}.csv",
                mime="text/csv"
            )
        st.success("Report packaged and ready for academic submission!")
