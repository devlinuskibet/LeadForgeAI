import re
from typing import Dict, Any, List

class EmailTemplateService:
    """
    Service for rendering dynamic email templates with placeholder interpolation
    and fallback defaults.
    """
    VARIABLE_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")

    def render(self, template: str, context: Dict[str, Any], defaults: Dict[str, str] = None) -> str:
        """
        Replaces {{ variable_name }} placeholders in template using context data.
        """
        defaults = defaults or {}

        def replace_match(match):
            var_name = match.group(1)
            if var_name in context and context[var_name] is not None:
                return str(context[var_name])
            if var_name in defaults:
                return str(defaults[var_name])
            return f"[Missing: {var_name}]"

        return self.VARIABLE_PATTERN.sub(replace_match, template)

    def extract_variables(self, template: str) -> List[str]:
        """
        Extracts all unique placeholder variable names from a template.
        """
        matches = self.VARIABLE_PATTERN.findall(template)
        return list(dict.fromkeys(matches))
