import time
from sqlalchemy.orm import Session
from models.ai_prompt import AIPromptVersion
from models.ai_log import AIRequest, AIUsage
from services.ai_provider import AIProviderInterface, MockProvider
from core.ai_config import ai_config
import uuid

class AIService:
    def __init__(self, db: Session):
        self.db = db
        # Strategy pattern: dynamically pick the provider based on config
        self.provider: AIProviderInterface = self._get_provider()

    def _get_provider(self) -> AIProviderInterface:
        if ai_config.AI_PROVIDER == "mock":
            return MockProvider()
        # Fallback to mock for now
        return MockProvider()

    def _render_prompt(self, template: str, variables: dict) -> str:
        # Simple string replacement for {{ variable }}
        rendered = template
        for key, value in variables.items():
            rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
        return rendered

    def execute_prompt(self, prompt_version: AIPromptVersion, variables: dict, organization_id: uuid.UUID, user_id: uuid.UUID = None) -> str:
        # 1. Render prompt
        rendered_prompt = self._render_prompt(prompt_version.template, variables)
        
        # 2. Invoke provider
        start_time = time.time()
        try:
            response = self.provider.generate_text(
                prompt=rendered_prompt,
                model=prompt_version.model,
                temperature=prompt_version.temperature,
                max_tokens=prompt_version.max_tokens
            )
            latency_ms = int((time.time() - start_time) * 1000)
            status = "SUCCESS"
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            status = "FAILED"
            # In a real app we'd log the exception properly and possibly retry
            response = None
            raise e
        finally:
            # 3. Log Request and Usage (Guardrails: no silent failures, always log)
            ai_request = AIRequest(
                prompt_version_id=prompt_version.id,
                rendered_prompt=rendered_prompt,
                raw_response=response.text if response else None,
                provider=ai_config.AI_PROVIDER,
                model=prompt_version.model,
                latency_ms=latency_ms,
                status=status,
                organization_id=organization_id,
                created_by=user_id
            )
            self.db.add(ai_request)
            self.db.flush() # Get request ID
            
            if response:
                # Basic cost estimation rule of thumb (mocked rates)
                # E.g. $0.0015 per 1k input, $0.002 per 1k output
                cost = (response.input_tokens / 1000 * 0.0015) + (response.output_tokens / 1000 * 0.002)
                ai_usage = AIUsage(
                    request_id=ai_request.id,
                    input_tokens=response.input_tokens,
                    output_tokens=response.output_tokens,
                    total_tokens=response.total_tokens,
                    estimated_cost=cost
                )
                self.db.add(ai_usage)
            
            self.db.commit()

        return response.text
