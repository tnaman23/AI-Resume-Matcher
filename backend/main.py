from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import os
import re


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="AI Resume Matcher",
    description="API for resume analysis and job matching",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# TEMPORARY RESUME STORAGE
# ============================================================

resume_text = ""


# ============================================================
# HOME ROUTE
# ============================================================

@app.get("/")
def home():
    return {
        "message": "AI Resume Matcher API is running!"
    }


# ============================================================
# RESUME PDF UPLOAD
# ============================================================

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    global resume_text

    # Check file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Create file path
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    # Save uploaded PDF
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Read PDF
    try:
        reader = PdfReader(file_path)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF file."
        )

    # Extract text
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    # Check whether text was extracted
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text was found in this PDF. "
                "Please upload a text-based PDF."
            )
        )

    # Store resume text
    resume_text = text

    return {
        "filename": file.filename,
        "message": "Resume uploaded successfully",
        "text": resume_text
    }


# ============================================================
# GET CURRENT RESUME
# ============================================================

@app.get("/resume")
def get_resume():

    if not resume_text:
        return {
            "message": "No resume uploaded yet.",
            "text": ""
        }

    return {
        "message": "Resume available",
        "text": resume_text
    }


# ============================================================
# JOB DESCRIPTION MODEL
# ============================================================

class JobDescription(BaseModel):
    text: str


# ============================================================
# JOB DESCRIPTION PDF UPLOAD
# ============================================================

@app.post("/upload-job-description")
async def upload_job_description(file: UploadFile = File(...)):

    # Check file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Create file path
    file_path = os.path.join(
        UPLOAD_DIR,
        "job_" + file.filename
    )

    # Save uploaded PDF
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Read PDF
    try:
        reader = PdfReader(file_path)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the job description PDF."
        )

    # Extract text
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    # Check extracted text
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text was found in the job description PDF. "
                "Please upload a text-based PDF."
            )
        )

    return {
        "filename": file.filename,
        "message": "Job description uploaded successfully",
        "text": text
    }


# ============================================================
# SKILL LIST
# ============================================================

SKILLS = [
    "python",
    "java",
    "c++",
    "c",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "html",
    "css",
    "javascript",
    "react",
    "node.js",
    "fastapi",
    "flask",
    "django",
    "git",
    "github",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "data science",
    "data structures",
    "algorithms",
    "dbms",
    "rest api",
    "api",
    "aws",
    "azure",
    "docker",
    "linux",
    "tensorflow",
    "pytorch",
    "pandas",
    "numpy",
    "power bi",
    "excel"
]


# ============================================================
# SKILL EXTRACTION FUNCTION
# ============================================================

def extract_skills(text):

    text = text.lower()

    found_skills = []

    for skill in SKILLS:

        escaped_skill = re.escape(skill)

        pattern = (
            r"(?<!\w)"
            + escaped_skill
            + r"(?!\w)"
        )

        if re.search(pattern, text):
            found_skills.append(skill)

    return found_skills


# ============================================================
# RESUME MATCHING
# ============================================================

@app.post("/match")
def match_resume(job: JobDescription):

    global resume_text

    # Check whether resume exists
    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume first."
        )

    # Extract skills
    resume_skills = extract_skills(resume_text)

    job_skills = extract_skills(job.text)

    # Find matched skills
    matched_skills = []

    for skill in job_skills:

        if skill in resume_skills:
            matched_skills.append(skill)

    # Find missing skills
    missing_skills = []

    for skill in job_skills:

        if skill not in resume_skills:
            missing_skills.append(skill)

    # Calculate match percentage
    if len(job_skills) > 0:

        match_percentage = round(
            (len(matched_skills) / len(job_skills)) * 100
        )

    else:

        match_percentage = 0

    return {
        "message": "Resume matched successfully",
        "match_percentage": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "resume_skills": resume_skills,
        "job_skills": job_skills
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "backend": "running"
    }
@app.get("/test")
def test():
    return {
        "message": "AI Resume Matcher backend is working on Render"
    }