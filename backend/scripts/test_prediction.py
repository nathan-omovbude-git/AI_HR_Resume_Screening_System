import joblib
import pandas as pd

# Load the brain you just trained
model = joblib.load('app/resume_model.pkl')

# Mock a candidate's features (instead of extracting them from a PDF)
fake_candidate = pd.DataFrame([{
    'Experience_Years': 8,
    'Skill_Match_Score': 85,
    'Education_Level_Score': 3,
    'Project_Count': 6
}])

prediction = model.predict(fake_candidate)
probability = model.predict_proba(fake_candidate)

print(f"Shortlisted: {'Yes' if prediction[0] == 1 else 'No'}")
print(f"Confidence: {probability[0][1]*100:.2f}%")