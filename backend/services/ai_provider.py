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
