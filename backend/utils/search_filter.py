from typing import Any, List, Optional
from sqlalchemy import or_

class SearchFilterBuilder:
    """
    Utility for building dynamic multi-column SQL search filters.
    """
    @staticmethod
    def build_text_search(model: Any, search_query: str, search_fields: List[str]) -> Optional[Any]:
        """
        Creates an ILIKE OR query filter across multiple string model attributes.
        """
        if not search_query or not search_fields:
            return None
            
        term = f"%{search_query.strip()}%"
        conditions = []
        for field in search_fields:
            if hasattr(model, field):
                attr = getattr(model, field)
                conditions.append(attr.ilike(term))
                
        if not conditions:
            return None
            
        return or_(*conditions)
