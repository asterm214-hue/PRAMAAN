import os
import sys
import subprocess
import shutil
import socket
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter_available = True
except ImportError:
    limiter_available = False
    class Limiter:
        def __init__(self, *args, **kwargs):
            pass
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
from contextlib import asynccontextmanager
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent

# Allow running as a script: `python backend/app.py`
if __name__ == "__main__" and __package__ is None:
    root_str = str(ROOT_DIR)
    if root_str not in sys.path:
        sys.path.insert(0, root_str)

load_dotenv(ROOT_DIR / ".env")

def detect_frontend_project_dir() -> Path | None:
    candidates = [
        ROOT_DIR / "frontend",
        ROOT_DIR,
    ]
    for candidate in candidates:
        if (candidate / "package.json").exists():
            return candidate
    return None


FRONTEND_PROJECT_DIR = detect_frontend_project_dir()
FRONTEND_DIR = (FRONTEND_PROJECT_DIR / "dist") if FRONTEND_PROJECT_DIR else (ROOT_DIR / "dist")
FRONTEND_INDEX = FRONTEND_DIR / "index.html"
NODE_MODULES_DIR = (FRONTEND_PROJECT_DIR / "node_modules") if FRONTEND_PROJECT_DIR else None
UPLOAD_DIR = BACKEND_DIR / "uploads"
DB_DIR = BACKEND_DIR


class SpaStaticFiles(StaticFiles):
    """
    StaticFiles with SPA fallback.

    If a path doesn't exist and it's not an `/api/*` URL, serve `index.html`
    so client-side routing can take over.
    """

    def lookup_path(self, path: str):
        full_path, stat_result = super().lookup_path(path)
        if stat_result is None:
            normalized = path.replace("\\", "/")
            if normalized.startswith("api/"):
                return full_path, stat_result
            if Path(path).suffix:
                return full_path, stat_result
            return super().lookup_path("index.html")
        return full_path, stat_result


class OptionalSpaStaticFiles(SpaStaticFiles):
    async def check_config(self) -> None:
        try:
            await super().check_config()
        except RuntimeError:
            # Frontend directory might not exist until the first build.
            return

def needs_build() -> bool:
    "Check if frontend needs build."
    if not FRONTEND_DIR.exists():
        return True
    if not FRONTEND_INDEX.exists():
        return True
    project_dir = FRONTEND_PROJECT_DIR or ROOT_DIR
    candidates = [
        project_dir / "pnpm-lock.yaml",
        project_dir / "package-lock.json",
        project_dir / "yarn.lock",
        project_dir / "bun.lockb",
        project_dir / "package.json",
        project_dir / "vite.config.ts",
    ]
    for path in candidates:
        if path.exists() and path.stat().st_mtime > FRONTEND_INDEX.stat().st_mtime:
            return True
    return False

def build_frontend():
    "Run frontend install & build (pnpm preferred, fallback to npm)."
    if FRONTEND_PROJECT_DIR is None:
        print("Frontend not detected (no package.json). Skipping frontend build.")
        return

    if not needs_build():
        return

    print("Building frontend...")
    pnpm_cmd = shutil.which("pnpm")
    npm_cmd = shutil.which("npm")
    if pnpm_cmd is None and npm_cmd is None:
        print("Neither pnpm nor npm found; skipping frontend build (API will still run).")
        return

    project_dir = FRONTEND_PROJECT_DIR
    node_modules = project_dir / "node_modules"
    needs_install = not node_modules.exists()

    try:
        if pnpm_cmd is not None:
            if needs_install:
                install_cmd = [pnpm_cmd, "install"]
                if (project_dir / "pnpm-lock.yaml").exists():
                    install_cmd += ["--frozen-lockfile"]
                subprocess.run(install_cmd, check=True, cwd=str(project_dir))
            subprocess.run([pnpm_cmd, "build"], check=True, cwd=str(project_dir))
        else:
            if needs_install:
                if (project_dir / "package-lock.json").exists():
                    subprocess.run([npm_cmd, "ci"], check=True, cwd=str(project_dir))
                else:
                    subprocess.run([npm_cmd, "install"], check=True, cwd=str(project_dir))
            subprocess.run([npm_cmd, "run", "build"], check=True, cwd=str(project_dir))

        print("Frontend built to dist/")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Frontend build failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    DB_DIR.mkdir(exist_ok=True)
    from backend.database import Base, engine, ensure_sqlite_schema
    ensure_sqlite_schema()
    Base.metadata.create_all(bind=engine)
    print("DB tables created")

    # Ensure demo credentials exist for the UI.
    try:
        from backend.database import SessionLocal
        from backend import crud, schemas

        db = SessionLocal()
        try:
            if not crud.get_user_by_email(db, email="demo@pramaan.ai"):
                demo = schemas.UserCreate(name="Demo User", email="demo@pramaan.ai", password="demo123")
                crud.create_user(db=db, user=demo)
                print("Demo user created (demo@pramaan.ai / demo123)")
        finally:
            db.close()
    except Exception as e:
        print(f"Demo user setup warning: {e}")

    build_frontend()
    import webbrowser
    if os.getenv("PRAMAAN_NO_BROWSER", "").strip() not in {"1", "true", "True"}:
        webbrowser.open("http://localhost:8000")
    yield

app = FastAPI(title="PRAMAAN API", version="1.0.0", lifespan=lifespan)

if limiter_available:
    limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute", "5/second"])
    app.state.limiter = limiter
    app.add_exception_handler(
        RateLimitExceeded,
        lambda req, exc: JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}),
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from backend.routers.auth import router as auth_router
    from backend.routers.testimony import router as testimony_router
    from backend.routers.timeline import router as timeline_router
    from backend.routers.recordings import router as recordings_router
    from backend.routers.legal import router as legal_router
    app.include_router(auth_router, prefix="/api")
    app.include_router(testimony_router, prefix="/api")
    app.include_router(timeline_router, prefix="/api")
    app.include_router(recordings_router, prefix="/api")
    app.include_router(legal_router, prefix="/api")
    print("Routers mounted")
except ImportError as e:
    print(f"Router import warning (normal if deps not full): {e}")

@app.get("/api/health")
async def health():
    return {"status": "ok", "frontend": FRONTEND_DIR.exists()}

@app.get("/")
async def root(request: Request):
    if FRONTEND_INDEX.exists():
        return FileResponse(str(FRONTEND_INDEX))
    return {
        "detail": "Frontend build not found (dist/). API is running.",
        "docs": "/docs",
        "frontend_dir": str(FRONTEND_DIR),
        "build_commands_powershell": ["npm.cmd install", "npm.cmd run build"],
    }

# Serve uploaded media on the same server.
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR), check_dir=False), name="uploads")

# IMPORTANT: Mount after API routes so `/api/*` isn't swallowed by StaticFiles.
# We mount unconditionally so that once `dist/` is built, the frontend is served
# without restarting the server.
app.mount("/", OptionalSpaStaticFiles(directory=str(FRONTEND_DIR), html=True, check_dir=False), name="frontend")

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.254.254.254", 1))
        return s.getsockname()[0]
    except:
        return "localhost"
    finally:
        s.close()

if __name__ == "__main__":
    lan_ip = get_lan_ip()
    print(f"LAN: http://{lan_ip}:8000")
    print("Open http://localhost:8000")
    print("PRAMAAN ready!")
    # NOTE: Uvicorn reload can be flaky on some Windows setups (WinError 5).
    reload_enabled = os.getenv("PRAMAAN_RELOAD", "").strip() in {"1", "true", "True"}
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=reload_enabled)


def run() -> None:
    lan_ip = get_lan_ip()
    print(f"LAN: http://{lan_ip}:8000")
    print("Open http://localhost:8000")
    print("PRAMAAN ready!")
    reload_enabled = os.getenv("PRAMAAN_RELOAD", "").strip() in {"1", "true", "True"}
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=reload_enabled)

