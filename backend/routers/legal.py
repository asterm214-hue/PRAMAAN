from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend.schemas import LegalGenerate, LegalResponse
from backend import crud
from jinja2 import Environment, FileSystemLoader
from pathlib import Path

router = APIRouter(prefix="/legal", tags=["legal"])

BACKEND_DIR = Path(__file__).resolve().parents[1]
TEMPLATES_DIR = BACKEND_DIR / "legal_templates"
UPLOAD_DIR = BACKEND_DIR / "uploads"

env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))

@router.post("/generate", response_model=LegalResponse)
def generate_legal(doc: LegalGenerate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # mock content
    template = env.get_template(f"{doc.doc_type.lower().replace(' ', '_')}.html")
    html = template.render(content="Mock testimony content for " + doc.doc_type)
    
    try:
        from weasyprint import HTML  # lazy import: requires external GTK libs on Windows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WeasyPrint not available: {e}")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = UPLOAD_DIR / f"{doc.doc_type}_{doc.testimony_id}.pdf"
    HTML(string=html).write_pdf(str(pdf_path))
    
    # create LegalDoc record
    return {"id": 1, "doc_type": doc.doc_type, "pdf_path": str(pdf_path)}
    
@router.get("/{id}", response_model=LegalResponse)
def get_legal(id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"id": id, "pdf_path": f"mock_{id}.pdf"}

