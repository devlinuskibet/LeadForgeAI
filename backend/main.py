from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from api import auth, companies, contacts, activities, notes, ai_management, copilot, prospecting
from core.errors import AppException, app_exception_handler, http_exception_handler, generic_exception_handler

app = FastAPI(title="LeadForgeAI API", version="0.1.0")

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to LeadForgeAI API"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(ai_management.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(prospecting.router, prefix="/api")
