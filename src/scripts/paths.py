"""Where things live. The repo holds the generator and the site; the exam PDFs and the
intermediate exam text stay outside it (set PD3_EXAMS to the folder with the PD3 PDFs)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))           # site pages are written to the repo root
SRC = os.path.join(REPO, "src")
EXAMS = os.environ.get("PD3_EXAMS", os.path.join(os.path.dirname(REPO), "PD3 samples collection (2004-2024)"))
WORK = os.path.join(EXAMS, "work")                     # raw text, segments.json, DDO cache (not committed)
