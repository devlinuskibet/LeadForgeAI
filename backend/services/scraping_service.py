import requests
from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)

class ScrapingService:
    def scrape_url(self, url: str) -> str:
        if not url.startswith("http"):
            url = "https://" + url

        try:
            # We use a standard user agent to avoid basic blocks
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            # Remove scripts, styles, and SVGs
            for element in soup(["script", "style", "svg", "noscript"]):
                element.decompose()

            # Extract Title and Meta Description
            title = soup.title.string if soup.title else ""
            meta_desc = ""
            meta_tag = soup.find("meta", attrs={"name": "description"})
            if meta_tag and "content" in meta_tag.attrs:
                meta_desc = meta_tag["content"]

            # Extract text
            text = soup.get_text(separator="\n")
            
            # Clean up excessive newlines and spaces
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = "\n".join(chunk for chunk in chunks if chunk)

            # Limit text length to avoid overflowing context
            clean_text = clean_text[:10000]

            final_text = f"Title: {title}\nMeta Description: {meta_desc}\n\nContent:\n{clean_text}"
            return final_text.strip()
            
        except Exception as e:
            logger.error(f"Failed to scrape {url}: {str(e)}")
            # Fallback if scraping fails so the AI still tries with minimal context
            return f"Failed to scrape website {url}. Error: {str(e)}"

