import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="CardScan AI/OCR Extraction Service",
    description="Offline-first visiting card OCR extraction backend service using PaddleOCR and FastAPI",
    version="1.0.0"
)

# Enable CORS for React Native & Web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "service": "CardScan AI/OCR Extraction API",
        "status": "online",
        "version": "1.0.0",
        "endpoint": "POST /extract-card"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
