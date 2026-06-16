import os
import io
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import standard data science tools available locally offline
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Lumen Hire Analytics Core Engine")

# Enable CORS for your frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "screening.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evaluation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_name TEXT NOT NULL,
                job_title TEXT NOT NULL,
                overall_score REAL NOT NULL,
                model_certainty REAL NOT NULL,
                slider_weights TEXT NOT NULL,
                xai_detected TEXT NOT NULL,
                xai_missing TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()

init_db()

# --- MOCK RANDOM FOREST PREDICTION PIPELINE ---
def run_random_forest_inference(experience: int, education_tier: int):
    """
    Simulates the internal decision boundary calculations of the trained
    Random Forest Classifier based on structural categorical features.
    """
    # High experience and education securely triggers upper class probability brackets
    if experience >= 5 and education_tier >= 3:
        probability_shortlist = 0.915
    elif experience >= 2:
        probability_shortlist = 0.784
    else:
        probability_shortlist = 0.342 # Assigned to alternative 'Talent Pool' tier
        
    return probability_shortlist

@app.get("/api/history")
async def get_history():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM evaluation_logs ORDER BY created_at DESC")
            rows = cursor.fetchall()
            
            history_list = []
            for row in rows:
                history_list.append({
                    "id": row["id"],
                    "candidate_name": row["candidate_name"],
                    "job_title": row["job_title"],
                    "overall_score": row["overall_score"],
                    "model_certainty": row["model_certainty"],
                    "slider_weights": json.loads(row["slider_weights"]),
                    "xai_detected": json.loads(row["xai_detected"]),
                    "xai_missing": json.loads(row["xai_missing"]),
                    "created_at": row["created_at"]
                })
            return history_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database sync fault: {str(e)}")

@app.post("/api/screen-resume")
async def screen_resume(
    file: UploadFile = File(...),
    experience_years: int = Form(...),
    education_level: str = Form(...),
    weight_semantic: int = Form(...),
    weight_experience: int = Form(...),
    weight_education: int = Form(...),
):
    # System boundary verification: Enforce strict PDF stream processing
    extension = os.path.splitext(file.filename)[1].lower()
    if extension != ".pdf":
        raise HTTPException(status_code=400, detail="Boundary Exception: System exclusively processes native digital .pdf file streams.")
    
    try:
        # Read file contents stream
        contents = await file.read()
        
        # --- KNOWLEDGE DOMAIN ONTOLOGY DEFINITION ---
        # Representing target requirements for a standard Backend Software Engineer position
        job_description_ontology = "python fastapi dynamic vector space architecture databases backend sqlite infrastructure docker"
        
        # Mocking extracted text layers for demonstration
        # (In production, replace this string with your pypdf/pdfplumber text conversion block)
        extracted_resume_text = "python backend architecture databases application development engineering models java javascript templates code debugging"
        
        # --- ENGINE 1: VECTOR SPACE MODEL (TF-IDF & COSINE SIMILARITY) ---
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([job_description_ontology, extracted_resume_text])
        
        # Compute exact mathematical angular distance allocation
        semantic_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        s_semantic = float(semantic_similarity * 100) # Map to 0-100 spectrum
        
        # Compute individual dynamic scores for other features
        s_experience = min(float((experience_years / 5) * 100), 100.0)
        
        edu_map = {"BSc": 80.0, "MSc": 95.0, "PhD": 100.0}
        s_education = edu_map.get(education_level, 50.0)
        
        # --- ENGINE 2: MACHINE LEARNING (RANDOM FOREST CONFIDENCE) ---
        edu_tier_code = {"BSc": 3, "MSc": 4, "PhD": 5}.get(education_level, 2)
        rf_probability = run_random_forest_inference(experience_years, edu_tier_code)
        model_certainty_pct = float(rf_probability * 100)

        # --- DYNAMIC CONSTRAINT WEIGHT SYNTHESIS ---
        final_score = (
            (weight_semantic * s_semantic) + 
            (weight_experience * s_experience) + 
            (weight_education * s_education)
        ) / 100.0
        
        # Run XAI Token Intersections for the frontend Emerald/Crimson visualizer
        job_tokens = set(job_description_ontology.split())
        resume_tokens = set(extracted_resume_text.split())
        
        detected_tokens = list(job_tokens.intersection(resume_tokens))
        missing_tokens = list(job_tokens.difference(resume_tokens))

        # --- PERSIST RESULT INTO RELATIONAL CACHE LOG ---
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            weights_json = json.dumps({"semantic": weight_semantic, "experience": weight_experience, "education": weight_education})
            cursor.execute("""
                INSERT INTO evaluation_logs (candidate_name, job_title, overall_score, model_certainty, slider_weights, xai_detected, xai_missing, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (file.filename, "Backend Software Engineer", round(final_score, 1), round(model_certainty_pct, 1), weights_json, json.dumps(detected_tokens), json.dumps(missing_tokens), datetime.utcnow().isoformat()))
            conn.commit()

        return {
            "verdict": {
                "shortlisted": 1 if final_score >= 60 else 0,
                "composite_score": round(final_score, 1),
                "model_certainty": round(model_certainty_pct, 1)
            },
            "xai_analysis": {
                "detected": detected_tokens,
                "missing": missing_tokens
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Core Processing Fault: {str(e)}")
