import re

# 1. THE KNOWLEDGE BASE (Mapped Dictionaries)
# This is how the AI "understands" the hierarchy of qualifications
EDUCATION_MAP = {
    "phd": 4,
    "doctorate": 4,
    "masters": 3,
    "msc": 3,
    "mba": 3,
    "bachelors": 2,
    "bsc": 2,
    "ba": 2,
    "diploma": 1,
    "high school": 0
}

SKILL_LIBRARY = {
    "python": 10,
    "machine learning": 15,
    "data analysis": 10,
    "sql": 8,
    "tableau": 7,
    "project management": 12,
    "communication": 5
}

def calculate_education_score(text):
    """Technique: Ordinal lookup to find the highest degree mentioned."""
    clean_text = text.lower()
    highest_score = 0
    detected_degree = "None Detected"
    
    for degree, value in EDUCATION_MAP.items():
        # Using word boundaries \b to avoid partial matches
        if re.search(rf"\b{degree}\b", clean_text):
            if value > highest_score:
                highest_score = value
                detected_degree = degree
                
    # Normalize score out of 100 (PhD = 100%, Bachelors = 50%)
    normalized_edu = (highest_score / 4) * 100
    return normalized_edu, detected_degree

def calculate_skill_score(text):
    """Technique: Weighted Keyword Frequency Analysis."""
    clean_text = text.lower()
    score = 0
    found_skills = []
    
    for skill, weight in SKILL_LIBRARY.items():
        if re.search(rf"\b{skill}\b", clean_text):
            score += weight
            found_skills.append(skill)
            
    max_score = sum(SKILL_LIBRARY.values())
    normalized_skills = (score / max_score) * 100
    return normalized_skills, found_skills

def generate_final_screening_score(resume_text, user_weights):
    """
    The Core Engine: Combines NLP extraction with User-Defined Weights.
    'user_weights' should be a dict like {'skills': 0.6, 'education': 0.4}
    """
    # 1. Get raw scores from text
    edu_score, degree = calculate_education_score(resume_text)
    skill_score, skills = calculate_skill_score(resume_text)
    
    # 2. Apply Weighted Arithmetic Mean (The logic from your UI)
    weighted_final = (
        (skill_score * user_weights.get('skills', 0.5)) + 
        (edu_score * user_weights.get('education', 0.5))
    )
    
    # 3. Return the 'Explainable' Result (XAI)
    return {
        "final_score": round(weighted_final, 2),
        "breakdown": {
            "education": {"score": edu_score, "detected": degree},
            "skills": {"score": skill_score, "detected": skills}
        },
        "formula_used": f"({skill_score} * {user_weights['skills']}) + ({edu_score} * {user_weights['education']})"
    }

# --- TEST BLOCK FOR SUPERVISOR ---
if __name__ == "__main__":
    test_resume = "Candidate with a Masters in CS and 5 years of Python and SQL experience."
    # These weights mimic your UI sliders
    mock_ui_sliders = {"skills": 0.7, "education": 0.3}
    
    result = generate_final_screening_score(test_resume, mock_ui_sliders)
    print(f"Final Candidate Score: {result['final_score']}%")
    print(f"Logic used: {result['formula_used']}")
    print(f"Education Detected: {result['breakdown']['education']['detected']} with score {result['breakdown']['education']['score']}")
    print(f"Skills Detected: {result['breakdown']['skills']['detected']}")