from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, drafts, emails, feedback, knowledge

app = FastAPI(title="MyMail API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(emails.router)
app.include_router(drafts.router)
app.include_router(knowledge.router)
app.include_router(feedback.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
