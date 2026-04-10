from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import sys

# Add parent directory to path to import models and storage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import routes
from app.api.routes import users, plans, sessions, analytics, export

# Create FastAPI app
app = FastAPI(
    title="Gym Progress Tracker API",
    description="A professional gym workout progress tracking system",
    version="1.0.0"
)

# Add CORS middleware for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(users.router, prefix="/api/user", tags=["User Profile"])
app.include_router(plans.router, prefix="/api/plan", tags=["Workout Plan"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Workout Sessions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Gym Progress Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
