"""
Veritas OCR Service
Extracts embedded textual content from imagery using local Tesseract OCR engine.
"""

import io
from typing import Optional
from PIL import Image
import pytesseract

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Runs Tesseract OCR locally on the supplied image bytes.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to grayscale for improved OCR contrast
        gray = image.convert("L")
        text = pytesseract.image_to_string(gray, lang="eng")
        return text.strip()
    except Exception as e:
        # Graceful fallback: return empty string if OCR encounters formatting issues
        return ""
