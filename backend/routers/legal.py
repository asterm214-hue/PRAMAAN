from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend.schemas import LegalGenerate, LegalResponse
from backend import crud
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/legal", tags=["legal"])

BACKEND_DIR = Path(__file__).resolve().parents[1]
TEMPLATES_DIR = BACKEND_DIR / "legal_templates"
UPLOAD_DIR = BACKEND_DIR / "uploads"

env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))

@router.post("/generate", response_model=LegalResponse)
def generate_legal(doc: LegalGenerate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    testimony = crud.get_testimony(db, doc.testimony_id)
    if not testimony or testimony.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Testimony not found")

    # Prepare template data
    template_data = doc.dict(exclude={"testimony_id", "doc_type"})
    template_data["victim_name"] = current_user.name
    template_data["narrative"] = testimony.content if testimony.type == "text" else "Recorded testimony (see transcript)"
    template_data["current_date"] = datetime.now().strftime("%Y-%m-%d")
    
    # Format dates/months for verification if not provided
    if not doc.verified_day:
        template_data["verified_day"] = datetime.now().strftime("%d")
    if not doc.verified_month_year:
        template_data["verified_month_year"] = datetime.now().strftime("%B, %Y")

    template = env.get_template(f"{doc.doc_type.lower().replace(' ', '_')}.html")
    html = template.render(**template_data)
    
    try:
        from weasyprint import HTML
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WeasyPrint not available: {e}")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{doc.doc_type.lower().replace(' ', '_')}_{doc.testimony_id}.pdf"
    pdf_path = UPLOAD_DIR / filename
    HTML(string=html).write_pdf(str(pdf_path))
    
    # Store in DB
    db_doc = crud.create_legal_doc(db, user_id=current_user.id, testimony_id=doc.testimony_id, doc_type=doc.doc_type, pdf_path=filename)
    
    return {"id": db_doc.id, "doc_type": doc.doc_type, "pdf_path": filename}
    
@router.get("/{id}", response_model=LegalResponse)
def get_legal(id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"id": id, "pdf_path": f"mock_{id}.pdf"}

