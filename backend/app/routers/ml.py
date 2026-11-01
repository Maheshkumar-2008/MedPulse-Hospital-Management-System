"""
Machine Learning Router.
Provides evaluation comparisons and interactive prediction endpoints for all 5 Scikit-Learn models.
"""

from fastapi import APIRouter, Depends
from backend.app.models.schemas import LOSPredictionRequest, ReadmissionPredictionRequest, TriagePredictionRequest
from backend.app.auth.dependencies import get_current_user
from machine_learning.model_evaluator import ml_engine
from machine_learning.linear_regression import los_model
from machine_learning.logistic_regression import logistic_model
from machine_learning.decision_tree import decision_tree_model
from machine_learning.random_forest import random_forest_model
from machine_learning.kmeans import kmeans_model

router = APIRouter(prefix="/ml", tags=["Machine Learning Models"])

@router.get("/summary")
async def get_all_models_summary(current_user: dict = Depends(get_current_user)):
    return ml_engine.get_comparison_summary()

@router.post("/predict/length-of-stay")
async def predict_length_of_stay(req: LOSPredictionRequest, current_user: dict = Depends(get_current_user)):
    ml_engine.ensure_trained()
    return los_model.predict(req.dict())

@router.post("/predict/readmission-logistic")
async def predict_readmission_logistic(req: ReadmissionPredictionRequest, current_user: dict = Depends(get_current_user)):
    ml_engine.ensure_trained()
    return logistic_model.predict(req.dict())

@router.post("/predict/readmission-random-forest")
async def predict_readmission_random_forest(req: ReadmissionPredictionRequest, current_user: dict = Depends(get_current_user)):
    ml_engine.ensure_trained()
    return random_forest_model.predict(req.dict())

@router.post("/predict/triage")
async def predict_triage_urgency(req: TriagePredictionRequest, current_user: dict = Depends(get_current_user)):
    ml_engine.ensure_trained()
    return decision_tree_model.predict(req.dict())

@router.get("/clusters/kmeans")
async def get_kmeans_clusters(current_user: dict = Depends(get_current_user)):
    ml_engine.ensure_trained()
    return kmeans_model.metrics
