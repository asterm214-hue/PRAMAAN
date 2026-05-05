# PRAMAAN Backend Integration TODO

## Approved Plan Steps

### Phase 1: Setup & Core Backend [✅]
- [✅] 1. Create requirements.txt
- [✅] 2. Create .env.example
- [✅] 3. Update .gitignore (add backend/db.sqlite, uploads/, dist/, .env)
- [✅] 4. Create backend/app.py (FastAPI app, frontend auto-build/serve, CORS/rate limit)
- [✅] 5. Create backend/database.py (SQLAlchemy setup)
- [✅] 6. Create backend/models.py (User, Testimony, TimelineEvent, Recording, LegalDoc)
- [✅] 7. Create backend/schemas.py (Pydantic models)

### Phase 2: Auth & Utils [✅]
- [✅] 8. Create backend/auth.py (JWT, bcrypt)
- [✅] 9. Create backend/crud.py (DB operations)
- [✅] 10. Create backend/routers/auth.py (endpoints)

### Phase 3: Feature Routers [✅]
- [✅] 11. Create backend/routers/testimony.py
- [✅] 12. Create backend/routers/timeline.py (mock AI)
- [✅] 13. Create backend/routers/recordings.py
- [✅] 14. Create backend/routers/legal.py (mock PDF gen)
- [✅] 15. Create backend/utils.py (file upload validation, LAN detect)

### Phase 4: Integration & Test [✅]
- [✅] 16. Mount routers in app.py
- [✅] 17. Add startup events (DB create, frontend build, open browser)
- [✅] 18. Update root README.md with instructions
- [ ] 19. Test full flow: pip install -r requirements.txt && python backend/app.py
- [ ] 20. Verify APIs /docs, frontend serves, auth, uploads, LAN

**Notes**: AI processing mocked (simple text split for timeline). PDF: Jinja+weasyprint. No frontend changes. Single command start.

Current Progress: Starting Phase 1.

