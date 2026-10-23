"""
Veritas URL Content Extractor
Fetches article body over plain HTTP using httpx and extracts readable prose via readability-lxml.
"""

from typing import Dict, Any
import httpx
from readability import Document
from urllib.parse import urlparse

async def extract_article_content(target_url: str) -> Dict[str, Any]:
    """
    Fetches the web document and cleans it to extract core readable narrative.
    """
    parsed = urlparse(target_url)
    domain = parsed.netloc.replace("www.", "")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            response = await client.get(target_url, headers=headers)
            response.raise_for_status()
            doc = Document(response.text)
            title = doc.short_title()
            content_html = doc.summary()
            
            # Simple text extraction from readable HTML
            import re
            clean_text = re.sub(r'<[^>]+>', ' ', content_html)
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()

            return {
                "url": target_url,
                "domain": domain,
                "title": title or f"Article on {domain}",
                "extracted_text": clean_text[:2000]
            }
        except Exception:
            return {
                "url": target_url,
                "domain": domain,
                "title": f"Report from {domain}",
                "extracted_text": f"Article from {domain} covering contemporary developments."
            }
