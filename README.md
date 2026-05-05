
# PRAMAAN - Fullstack App (React Frontend + FastAPI Backend)

Original UI from Figma: https://www.figma.com/design/mp8d0g0YDLssFGMgqVMKku/PRAMAAN-Website-UI-Design

## Quick Start (Single Command)

```bash
pip install -r requirements.txt
python app.py
```

This:
- Installs Python deps
- Auto-builds the frontend to `dist/` (prefers `pnpm`, falls back to `npm`)
- Creates SQLite DB
- Starts server at http://localhost:8000 (auto-opens browser)
- Serves frontend SPA + APIs /api/*
- LAN accessible (printed)

If the frontend is not showing at `/`, build it once manually:

```powershell
npm.cmd install
npm.cmd run build
```

## Features
- Full auth (signup/login JWT)
- Record testimony (text/audio/video upload)
- AI Timeline (mock)
- Secure Vault (recordings)
- Legal PDF gen (Victim Statement etc.)
- Rate limited, CORS, file validated

## Development
Frontend (manual):
- If you have `pnpm`: `pnpm dev`
- Otherwise (Windows PowerShell): `npm.cmd run dev`

Backend: `uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000`

API Docs: /docs

## Structure
- Frontend: src/ (existing React/Vite/Shadcn)
- Backend: backend/ (FastAPI/SQLAlchemy/SQLite)

No frontend changes. Ready git clone + pip + python backend/app.py
  
