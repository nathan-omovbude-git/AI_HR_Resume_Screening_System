# AI HR Resume Screening Prototype

This project is a **working prototype** demonstrating how an AI-assisted résumé
screening system can be built for early-stage recruiting.

It combines:
- **Keyword matching** (configurable skills list)
- **Semantic similarity** (TF-IDF + cosine similarity)
- **Custom weighted scoring** with explainability

> ⚠️ This project is for academic/demo use only. It does **not** represent a
> production-ready hiring platform.

## Getting started

1. Create and activate a Python environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the dashboard:

```powershell
streamlit run app/main.py
```

4. In the UI:
- Upload one or more résumé files (PDF or TXT)
- Enter a job description or list of target skills
- Adjust scoring weights and review ranked candidates

## Project structure

- `app/main.py` — Streamlit dashboard / entry point
- `requirements.txt` — Python dependencies
- `data/` — (empty) place sample résumés here if desired

## Notes

- Résumés are **not stored**; they are processed in memory for the session.
- You can extend the scoring functions (e.g., add bias mitigation, structured
  attribute extraction, or model-based evaluation) to support more advanced
  workflows.
