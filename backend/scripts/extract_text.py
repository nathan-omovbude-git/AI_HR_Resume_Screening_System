# --- Guided by requirements.txt ---
import pdfplumber  # You must have 'pdfplumber' in your requirements.txt
import re          # Built-in, no requirement needed

# --- Guided by README.md / Project Scope ---
def extract_from_resume(pdf_path):
    """
    Layout follows the 'System Architecture' defined in your README:
    1. Input: PDF File
    2. Process: Text Extraction & Cleaning
    3. Output: Structured Features (Experience, Skills, Education)
    """
    with pdfplumber.open(pdf_path) as pdf:
        # Layout for extracting text
        raw_text = " ".join([page.extract_text() for page in pdf.pages])
    
    # Logic for 'Feature Engineering' mentioned in your README
    skills_found = re.findall(r"(python|sql|machine learning)", raw_text.lower())
    
    return skills_found