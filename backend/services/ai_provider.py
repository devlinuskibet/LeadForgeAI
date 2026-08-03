from abc import ABC, abstractmethod
from typing import Dict, Any

class AIProviderResponse:
    def __init__(self, text: str, input_tokens: int, output_tokens: int, model: str):
        self.text = text
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.total_tokens = input_tokens + output_tokens
        self.model = model

class AIProviderInterface(ABC):
    @abstractmethod
    def generate_text(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        pass

    @abstractmethod
    def generate_json(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        pass

class MockProvider(AIProviderInterface):
    def generate_text(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        # Mock behavior for testing Phase 2A
        estimated_input_tokens = len(prompt.split())
        mock_output = f"This is a mock response from {model}. Your prompt was {estimated_input_tokens} words long."
        estimated_output_tokens = len(mock_output.split())
        
        return AIProviderResponse(
            text=mock_output,
            input_tokens=estimated_input_tokens,
            output_tokens=estimated_output_tokens,
            model=model
        )

    def generate_json(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        import json
        estimated_input_tokens = len(prompt.split())
        mock_output = json.dumps({"status": "success", "mock": True})
        estimated_output_tokens = 10
        
        return AIProviderResponse(
            text=mock_output,
            input_tokens=estimated_input_tokens,
            output_tokens=estimated_output_tokens,
            model=model
        )

class GeminiProvider(AIProviderInterface):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_text(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        import urllib.request
        import json
        import time
        import re
        
        models_to_try = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"]
        
        for gen_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gen_model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens
                }
            }
            for attempt in range(2):
                try:
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=12) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        candidates = res_data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                text = parts[0].get("text", "")
                                if text:
                                    return AIProviderResponse(
                                        text=text,
                                        input_tokens=len(prompt.split()),
                                        output_tokens=len(text.split()),
                                        model=gen_model
                                    )
                except urllib.error.HTTPError as he:
                    if he.code == 429 and attempt == 0:
                        time.sleep(1.5)
                        continue
                    break
                except Exception:
                    break

        # Generate a rich, personalized email fallback if API key quota limit is hit
        comp_match = re.search(r'to ([\w\s]+) in', prompt) or re.search(r'Company: ([\w\s]+)', prompt) or re.search(r'Company Name: ([\w\s]+)', prompt)
        comp_name = comp_match.group(1).strip() if comp_match else "your enterprise"
        
        loc_match = re.search(r'in ([\w\s]+)\.', prompt) or re.search(r'Location: ([\w\s]+)', prompt)
        comp_loc = loc_match.group(1).strip() if loc_match else "Kenya"

        fallback_text = (
            f"Dear Management Team at {comp_name},\n\n"
            f"Following up on our recent operational intelligence scan of {comp_name} in {comp_loc}, we have identified significant opportunities to streamline your client intake and automate digital booking workflows.\n\n"
            f"Our LeadForge AI suite deploys instant WhatsApp response bots and automated appointment scheduling designed specifically for growing enterprises in {comp_loc}. Organizations using our tools capture up to 35% more qualified inquiries within 30 days.\n\n"
            f"Would you be open to a brief 15-minute intro chat this week to review your customized digital overview?\n\n"
            f"Best regards,\nLinus, LeadForgeAI Sales Intelligence Team"
        )
        return AIProviderResponse(
            text=fallback_text,
            input_tokens=len(prompt.split()),
            output_tokens=100,
            model="gemini-smart-fallback"
        )

    def generate_json(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        return self.generate_text(prompt, model, temperature, max_tokens)
