"""
Veritas EXIF & Image Forensics Service
Inspects binary metadata for authentic camera hardware profiles and synthetic diffusion markers.
"""

import io
from typing import Dict, Any, List
from PIL import Image, ExifTags

def inspect_image_metadata(image_bytes: bytes) -> Dict[str, Any]:
    """
    Evaluates EXIF camera hardware tags and synthetic generator signatures.
    Returns label: 'Looks real' | 'Likely AI-generated' | 'Unclear'
    """
    technical_indicators: List[str] = []
    has_exif_camera_data = False
    camera_make = None
    camera_model = None
    software_detected = None

    try:
        image = Image.open(io.BytesIO(image_bytes))
        raw_info = image.info

        # Check for generator metadata in PNG text chunks
        for key, val in raw_info.items():
            if isinstance(val, str):
                val_lower = val.lower()
                if "midjourney" in val_lower:
                    software_detected = "Midjourney"
                elif "stable diffusion" in val_lower or "sdxl" in val_lower or "comfyui" in val_lower:
                    software_detected = "Stable Diffusion / ComfyUI"
                elif "dall-e" in val_lower:
                    software_detected = "DALL-E"

        if software_detected:
            technical_indicators.append(f"Synthetic generator signature detected: {software_detected}")

        # Check EXIF tags in JPEG/TIFF
        exif_data = image.getexif()
        if exif_data:
            for tag_id, value in exif_data.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                if tag_name == "Make":
                    camera_make = str(value).strip()
                elif tag_name == "Model":
                    camera_model = str(value).strip()
                elif tag_name == "Software":
                    soft_val = str(value).strip()
                    if any(gen in soft_val.lower() for gen in ["diffusion", "midjourney", "comfy", "automatic1111"]):
                        software_detected = soft_val
                        technical_indicators.append(f"Synthetic software tag detected: {soft_val}")

        if camera_make or camera_model:
            has_exif_camera_data = True
            hardware_str = f"{camera_make or ''} {camera_model or ''}".strip()
            technical_indicators.append(f"Optical sensor capture hardware tag found: {hardware_str}")

    except Exception:
        technical_indicators.append("Standard EXIF metadata absent or unreadable")

    # Determine authenticity label
    if software_detected:
        label = "Likely AI-generated"
        reasoning = f"Metadata inspection detected synthetic generation signatures associated with {software_detected}."
    elif has_exif_camera_data:
        label = "Looks real"
        reasoning = f"Authentic camera optical hardware tags present ({camera_make} {camera_model}), consistent with physical camera capture."
    else:
        label = "Unclear"
        reasoning = "Original EXIF camera sensor tags are absent or were scrubbed during web transmission. No definitive hardware markers found."

    return {
        "label": label,
        "hasExifCameraData": has_exif_camera_data,
        "cameraMake": camera_make,
        "cameraModel": camera_model,
        "softwareDetected": software_detected,
        "reasoning": reasoning,
        "technicalIndicators": technical_indicators
    }
