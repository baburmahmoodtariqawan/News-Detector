"""
Veritas Input Router
Dispatches multi-modal requests to appropriate processing pipelines.
"""

from typing import Dict, Any
from .research_bridge import ResearchBridge, BridgeException
from .ocr_service import extract_text_from_image
from .exif_service import inspect_image_metadata
from .url_fetcher import extract_article_content
from .stt_service import transcribe_audio_english, NonEnglishAudioError, VoiceProcessingError

bridge = ResearchBridge()

async def route_text_query(text: str) -> Dict[str, Any]:
    return await bridge.query_with_retry(text)

async def route_image_query(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    # 1. OCR text extraction
    ocr_text = extract_text_from_image(image_bytes)
    # 2. Forensic EXIF & metadata inspection
    metadata = inspect_image_metadata(image_bytes)
    # 3. Formulate research query
    query_prompt = f"Image forensic analysis. OCR text: '{ocr_text}'. EXIF status: {metadata['label']}."
    research_data = await bridge.query_with_retry(query_prompt)
    
    return {
        **research_data,
        "imageAssessment": metadata
    }

async def route_url_query(url: str) -> Dict[str, Any]:
    article_data = await extract_article_content(url)
    research_data = await bridge.query_with_retry(f"Article context from {article_data['domain']}: {article_data['title']}")
    return {
        **research_data,
        "urlMetadata": article_data
    }

async def route_voice_query(audio_bytes: bytes) -> Dict[str, Any]:
    transcript = transcribe_audio_english(audio_bytes)
    research_data = await bridge.query_with_retry(transcript)
    return {
        **research_data,
        "transcript": transcript
    }
