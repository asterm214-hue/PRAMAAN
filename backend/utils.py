import os
import mimetypes
from pathlib import Path
from typing import Tuple

def validate_upload(file: UploadFile) -> Tuple[bool, str]:
    allowed_mimes = {
        'audio/mpeg', 'audio/wav',
        'video/mp4', 'video/webm'
    }
    max_size_mb = 10
    mime = file.content_type or mimetypes.guess_type(file.filename)[0]
    if mime not in allowed_mimes:
        return False, "Invalid MIME type"
    if file.size > max_size_mb * 1024 * 1024:
        return False, "File too large"
    return True, ""

def generate_pdf(html_content: str, filename: str):
    from weasyprint import HTML
    pdf_path = f"backend/uploads/{filename}.pdf"
    HTML(string=html_content).write_pdf(pdf_path)
    return pdf_path

def get_lan_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.254.254.254", 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

