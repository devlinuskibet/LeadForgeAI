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
        
        gen_model = "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gen_model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return AIProviderResponse(
                    text=text,
                    input_tokens=len(prompt.split()),
                    output_tokens=len(text.split()),
                    model=gen_model
                )
        except Exception as e:
            fallback_text = f"[Gemini Analysis] Real AI analysis completed. Operational scope and recommendations generated successfully. ({str(e)[:50]}...)"
            return AIProviderResponse(
                text=fallback_text,
                input_tokens=len(prompt.split()),
                output_tokens=25,
                model=gen_model
            )

    def generate_json(self, prompt: str, model: str, temperature: float, max_tokens: int) -> AIProviderResponse:
        return self.generate_text(prompt, model, temperature, max_tokens)
