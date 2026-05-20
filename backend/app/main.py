"""AI-assisted résumé screening dashboard.

This is a lightweight prototype demonstrating how structured scoring,
ML-based similarity, and explainability can be combined to rank candidates.

Run:
    streamlit run app/main.py

The app supports uploading multiple résumés (PDF or TXT), entering a job
description / desired skills, and tuning a weighted scoring framework.
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import pdfplumber
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SKILL_KEYWORDS_DEFAULT = [
    
    "python",
    "data analysis",
    "machine learning",
    "communication",
    "team",
    "project management",
    "sql",
    "statistics",
    "cloud",
    "automation",
]


def clean_text(text: str) -> str:
    # Basic normalization for keyword matching & TF-IDF
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def load_resume_text(uploaded_file) -> str:
    """Turn an uploaded file into plain text.

    Supports PDF and plain text files.
    """

    name = uploaded_file.name.lower()

    if name.endswith(".pdf"):
        try:
            with pdfplumber.open(uploaded_file) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
            return "\n\n".join(pages)
        except Exception as e:
            raise ValueError(f"Unable to parse PDF: {e}")

    if name.endswith(".txt"):
        raw = uploaded_file.getvalue().decode("utf-8", errors="replace")
        return raw

    raise ValueError("Unsupported file type. Please upload a PDF or TXT file.")


@dataclass
class ResumeScore:
    filename: str
    text: str
    keyword_matches: Dict[str, bool]
    keyword_score: float
    semantic_score: float
    length_score: float
    final_score: float


def score_resumes(
    resume_texts: Dict[str, str],
    job_description: str,
    skill_keywords: List[str],
    weights: Dict[str, float],
) -> List[ResumeScore]:
    """Compute a score for each resume.

    The final score is a weighted sum of:
    - keyword match score (how many desired keywords appear in the resume)
    - semantic similarity between the resume and job description (TF-IDF cosine)
    - length score (reasonable length boosts score slightly)
    """

    normalized_job = clean_text(job_description)
    normalized_resumes = {k: clean_text(v) for k, v in resume_texts.items()}

    # Keyword match
    keyword_lower = [k.lower() for k in skill_keywords if k.strip()]
    keyword_matches: Dict[str, Dict[str, bool]] = {}
    keyword_scores: Dict[str, float] = {}

    for name, text in normalized_resumes.items():
        matches = {kw: (kw in text) for kw in keyword_lower}
        keyword_matches[name] = matches
        keyword_scores[name] = sum(matches.values()) / max(len(keyword_lower), 1)

    # Semantic similarity: build TF-IDF over all docs (job desc + resumes)
    docs = [normalized_job] + list(normalized_resumes.values())
    tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
    matrix = tfidf.fit_transform(docs)

    job_vec = matrix[0:1]
    resume_vecs = matrix[1:]

    similarities = cosine_similarity(job_vec, resume_vecs).flatten()
    semantic_scores = {
        name: float(sim)
        for name, sim in zip(normalized_resumes.keys(), similarities)
    }

    # Length score: moderate length is preferred (not absurdly short or huge)
    lengths = {name: len(text.split()) for name, text in normalized_resumes.items()}
    # Clip lengths into [100, 1500] range for scoring
    def length_score(n: int) -> float:
        n_clamped = min(max(n, 100), 1500)
        return (n_clamped - 100) / (1500 - 100)

    length_scores = {name: length_score(n) for name, n in lengths.items()}

    # Aggregate
    results: List[ResumeScore] = []
    for name in normalized_resumes:
        final = (
            weights["keywords"] * keyword_scores[name]
            + weights["semantic"] * semantic_scores[name]
            + weights["length"] * length_scores[name]
        )
        results.append(
            ResumeScore(
                filename=name,
                text=normalized_resumes[name],
                keyword_matches=keyword_matches[name],
                keyword_score=keyword_scores[name],
                semantic_score=semantic_scores[name],
                length_score=length_scores[name],
                final_score=float(final),
            )
        )

    # Normalize final score to 0..1
    scores = [r.final_score for r in results] or [0]
    min_s, max_s = min(scores), max(scores)
    for r in results:
        r.final_score = (r.final_score - min_s) / (max_s - min_s + 1e-12)

    return sorted(results, key=lambda r: r.final_score, reverse=True)


def format_keywords_for_display(keyword_matches: Dict[str, bool]) -> str:
    matched = [k for k, v in keyword_matches.items() if v]
    missing = [k for k, v in keyword_matches.items() if not v]

    parts = []
    if matched:
        parts.append("✅ " + ", ".join(sorted(matched)))
    if missing:
        parts.append("⚪ " + ", ".join(sorted(missing)))
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Streamlit app
# ---------------------------------------------------------------------------

def main() -> None:
    st.set_page_config(
        page_title="AI Resume Screening Prototype",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("AI-Assisted Résumé Screening Prototype")
    st.markdown(
        """
        This prototype demonstrates a hybrid scoring workflow combining keyword-based
        ranking, semantic similarity, and an explainable weighted scoring framework.
        Use the sidebar to upload candidate résumés, describe the role, and tune
        scoring weights.
        """
    )

    with st.sidebar:
        st.header("Inputs")
        uploaded = st.file_uploader(
            "Upload one or more résumé files (PDF or TXT)",
            type=["pdf", "txt"],
            accept_multiple_files=True,
        )

        st.markdown("---")
        st.subheader("Role description")
        job_description = st.text_area(
            "Enter a short job description, key responsibilities, or target skills.",
            value="""We are looking for a data-oriented engineer with strong Python, SQL, and
communication skills. Experience with machine learning, data analysis, and cloud
platforms is a plus.""",
            height=200,
        )

        st.markdown("---")
        st.subheader("Desired skills / keywords")
        skill_keywords_text = st.text_area(
            "Enter desired skills or keywords (comma-separated)",
            value=", ".join(SKILL_KEYWORDS_DEFAULT),
            height=120,
        )

        st.markdown("---")
        st.subheader("Scoring weights")
        w_keywords = st.slider("Keyword match weight", 0.0, 1.0, 0.4, 0.05)
        w_semantic = st.slider("Semantic similarity weight", 0.0, 1.0, 0.5, 0.05)
        w_length = st.slider("Length score weight", 0.0, 1.0, 0.1, 0.05)

        total = w_keywords + w_semantic + w_length
        if total == 0:
            st.warning("At least one weight must be > 0 to score candidates.")
        else:
            # Normalize weights so they sum to 1 for easier interpretation
            w_keywords /= total
            w_semantic /= total
            w_length /= total

        st.markdown("---")
        st.caption(
            "This prototype is for academic/demo use: it does not store résumés or "
            "make hiring decisions. Use outputs as a starting point for human review."
        )

    if not uploaded:
        st.info("Upload at least one résumé file to begin scoring candidates.")
        return

    skill_keywords = [s.strip() for s in skill_keywords_text.split(",") if s.strip()]

    resumes: Dict[str, str] = {}
    errors: List[Tuple[str, str]] = []

    for f in uploaded:
        try:
            text = load_resume_text(f)
            if not text.strip():
                raise ValueError("Resume text is empty after parsing.")
            resumes[f.name] = text
        except Exception as exc:
            errors.append((f.name, str(exc)))

    if errors:
        st.error("Some files could not be processed:")
        for name, err in errors:
            st.write(f"**{name}**: {err}")

    if not resumes:
        st.error("No successfully parsed résumés available for scoring.")
        return

    weights = {"keywords": w_keywords, "semantic": w_semantic, "length": w_length}

    with st.spinner("Scoring candidates..."):
        scored = score_resumes(resumes, job_description, skill_keywords, weights)

    df = pd.DataFrame(
        [
            {
                "Candidate": r.filename,
                "Final score": r.final_score,
                "Keyword score": r.keyword_score,
                "Semantic score": r.semantic_score,
                "Length score": r.length_score,
            }
            for r in scored
        ]
    )

    st.subheader("Candidate ranking")
    st.dataframe(df.style.format({"Final score": "{:.3f}", "Keyword score": "{:.3f}", "Semantic score": "{:.3f}", "Length score": "{:.3f}"}))

    st.markdown("---")
    st.subheader("Explainability (per candidate)")
    for r in scored:
        with st.expander(f"{r.filename} — ${r.final_score:.3f}"):
            st.markdown(f"**Keyword match (score: {r.keyword_score:.3f})**")
            st.markdown(format_keywords_for_display(r.keyword_matches))
            st.markdown(f"**Semantic similarity (score: {r.semantic_score:.3f})**")
            st.caption(
                "This is a TF-IDF cosine similarity between the job description and the résumé."
            )
            st.markdown(f"**Length score (score: {r.length_score:.3f})**")
            st.caption(
                "Scores near 0 indicate very short or extremely long résumés; 1 is in a target range."
            )

    st.sidebar.markdown("---")
    st.sidebar.markdown(
        "### How to use this prototype\n"
        "1. Upload résumés (PDF or TXT).\n"
        "2. Enter a job description and/or adjust keywords.\n"
        "3. Tune weights to see how ranking changes.\n"
        "4. Expand candidates to see why scores differ.\n"
    )


if __name__ == "__main__":
    main()
