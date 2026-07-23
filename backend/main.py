from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth

app = FastAPI(title="LeadForgeAI API", version="0.1.0")

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
