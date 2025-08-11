from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.routers import auth, users, documents, models, export, search
from app.core.config import settings

app = FastAPI(
    title="FlowCraft AI",
    description="Privacy-first document processing platform with local AI analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users, prefix="/api/v1/users", tags=["users"])
app.include_router(documents, prefix="/api/v1/documents", tags=["documents"])
app.include_router(models, prefix="/api/v1/models", tags=["ai-models"])
app.include_router(export, prefix="/api/v1/export", tags=["export"])
app.include_router(search, prefix="/api/v1/search", tags=["search"])

@app.get("/")
async def root():
    return {
        "message": "FlowCraft AI - Privacy-First Document Processing",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FlowCraft AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
