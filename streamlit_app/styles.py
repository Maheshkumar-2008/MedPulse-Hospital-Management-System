"""
Healthcare Theme Styling for Streamlit Hospital Portal.
"""

MEDICAL_CSS = """
<style>
    /* Main Background & Clean Typography */
    .main {
        background-color: #f8fafc;
        color: #0f172a;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Header Container */
    .hospital-header {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        padding: 24px 32px;
        border-radius: 12px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
    }
    
    .hospital-header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: white;
    }
    
    .hospital-header p {
        margin: 6px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
    }

    /* KPI Cards */
    .kpi-card {
        background: white;
        border-radius: 10px;
        padding: 18px 20px;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #0284c7;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        margin-bottom: 16px;
    }
    
    .kpi-title {
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .kpi-value {
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 4px;
    }

    /* Dataframe Styling */
    .stDataFrame {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
    }

    /* Buttons */
    .stButton>button {
        background-color: #0284c7;
        color: white;
        font-weight: 600;
        border-radius: 6px;
        border: none;
        padding: 8px 18px;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background-color: #0369a1;
        box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
    }
</style>
"""
