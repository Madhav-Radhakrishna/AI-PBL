import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.seed_data import seed_hyderabad_scenario
from app.routes import routing, ml_api, shelters, simulation, admin, planning, knowledge

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Disaster Evacuation Route Planning System Backend (AI PBL)",
    version="1.0.0"
)

# Enable CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(routing.router, prefix=settings.API_V1_STR)
app.include_router(ml_api.router, prefix=settings.API_V1_STR)
app.include_router(shelters.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(planning.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        seed_hyderabad_scenario(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "ONLINE",
        "demo_scenario": "Hyderabad Flood Emergency — Simulation",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
