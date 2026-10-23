"""
Veritas FastAPI Application Entry Point
Exposes brand-neutral context and verification research endpoints.
Zero API keys are exposed or required.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from .router import (
    route_text_query,
    route_image_query,
    route_url_query,
    route_voice_query,
    BridgeException,
    NonEnglishAudioError,
    VoiceProcessingError
)

app = FastAPI(
    title="Veritas Engine API",
    description="Context and verification research backend without API keys.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextQueryRequest(BaseModel):
    query: str

class UrlQueryRequest(BaseModel):
    url: str

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Veritas Context Engine"}

@app.post("/api/analyze/text")
async def analyze_text(payload: TextQueryRequest):
    try:
        result = await route_text_query(payload.query)
        return {"success": True, "data": result}
    except BridgeException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="We couldn't complete the research right now. Please try again in a moment.")

@app.post("/api/analyze/url")
async def analyze_url(payload: UrlQueryRequest):
    try:
        result = await route_url_query(payload.url)
        return {"success": True, "data": result}
    except BridgeException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="We couldn't complete the research right now. Please try again in a moment.")

@app.post("/api/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await route_image_query(content, file.filename or "upload.jpg")
        return {"success": True, "data": result}
    except BridgeException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="We couldn't complete the research right now. Please try again in a moment.")

@app.post("/api/analyze/voice")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await route_voice_query(content)
        return {"success": True, "data": result}
    except NonEnglishAudioError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except VoiceProcessingError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except BridgeException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="We couldn't complete the research right now. Please try again in a moment.")
