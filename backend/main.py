from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from api import auth, companies, contacts, activities, notes, ai_management, copilot, prospecting, dashboard, discovery, emails, health, export, deals
from core.errors import AppException, app_exception_handler, http_exception_handler, generic_exception_handler
from core.middleware import SecurityHeadersMiddleware
from core.rate_limiter import RateLimiterMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all database models are imported and tables are created on app startup
    try:
        import models
        from models.base import Base
        from core.database import engine
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Lifespan DB setup note: {e}")
    yield

app = FastAPI(title="LeadForgeAI API", version="0.1.0", lifespan=lifespan)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Security & Rate Limiting Middlewares
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Middleware (must be outermost middleware to process preflight OPTIONS requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to LeadForgeAI API"}

app.include_router(health.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(ai_management.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(prospecting.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(discovery.router, prefix="/api")
app.include_router(emails.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
