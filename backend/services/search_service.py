from abc import ABC, abstractmethod
from typing import List, Dict, Any
from sqlalchemy.orm import Session

class SearchService(ABC):
    @abstractmethod
    def search_companies(self, query: str, filters: Dict[str, Any] = None) -> List[Any]:
        pass

    @abstractmethod
    def search_contacts(self, query: str, filters: Dict[str, Any] = None) -> List[Any]:
        pass

class PostgresSearchService(SearchService):
    def __init__(self, db: Session):
        self.db = db

    def search_companies(self, query: str, filters: Dict[str, Any] = None) -> List[Any]:
        from models.company import Company
        q = self.db.query(Company).filter(Company.is_deleted == False)
        if query:
            q = q.filter(Company.name.ilike(f"%{query}%"))
        return q.all()

    def search_contacts(self, query: str, filters: Dict[str, Any] = None) -> List[Any]:
        from models.contact import Contact
        q = self.db.query(Contact).filter(Contact.is_deleted == False)
        if query:
            q = q.filter(Contact.first_name.ilike(f"%{query}%") | Contact.last_name.ilike(f"%{query}%"))
        return q.all()
