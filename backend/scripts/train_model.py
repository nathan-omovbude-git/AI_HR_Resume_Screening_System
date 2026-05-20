import sys
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib  # For saving the model

# --- ENVIRONMENT ASSESSMENT ---
print("--- ENVIRONMENT ASSESSMENT ---")
print(f"Python Version: {sys.version}")
print(f"Executable Path: {sys.executable}")
print(f"Library Search Paths: {sys.path[:3]}")  # Just the first few for clarity
print("------------------------------\n")


def train_resume_model():
    # 1. DYNAMIC PATH RESOLUTION
    # Find the 'scripts' folder directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Go one level up to 'AI_HR_Resume_Screening'
    project_root = os.path.abspath(os.path.join(script_dir, os.pardir))
    
    # Build robust absolute target paths
    data_path = os.path.join(project_root, 'data', 'raw', 'ai_hiring_data.csv')
    model_save_path = os.path.join(project_root, 'app', 'resume_model.pkl')
    
    print(f"Locating dataset at: {data_path}")
    
    # 2. LOAD DATASET
    df = pd.read_csv(data_path)
    
    # 3. IDENTIFY FEATURES AND TARGET
    features = ['Experience_Years', 'Skill_Match_Score', 'Education_Level_Score', 'Project_Count']
    X = df[features]
    y = df['Shortlisted']
    
    # 4. SPLIT TRAINING & TESTING DATA
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 5. INITIALIZE & TRAIN THE RANDOM FOREST ENGINE
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    # 6. EVALUATE PERFORMANCE (Technical Proof for Report)
    predictions = model.predict(X_test)
    print("\n--- Model Performance ---")
    print(classification_report(y_test, predictions))
    
    # 7. FEATURE IMPORTANCE ANALYSIS (Explainable AI / XAI Layer)
    importances = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values(by='importance', ascending=False)
    
    print("--- Feature Importance (XAI Layer) ---")
    print(importances)
    
    # 8. PERSIST MODEL OBJECT FOR THE STREAMLIT APP
    joblib.dump(model, model_save_path)
    print(f"\nModel safely saved to: {model_save_path}")
    
    return model, importances


if __name__ == "__main__":
    # Execute the self-contained pipeline directly
    train_resume_model()