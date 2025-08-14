from fastapi import APIRouter
from . import auth, documents, models, export, dashboard, search, users

# Create the main v1 API router
api_v1_router = APIRouter()

# Include all v1 endpoints
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_v1_router.include_router(models.router, prefix="/models", tags=["AI Models"])
api_v1_router.include_router(export.router, prefix="/export", tags=["Export"])
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(search.router, prefix="/search", tags=["Search"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
