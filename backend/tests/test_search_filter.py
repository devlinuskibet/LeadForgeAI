import unittest
from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base
from utils.search_filter import SearchFilterBuilder

Base = declarative_base()

class SampleModel(Base):
    __tablename__ = "sample_model"
    name = Column(String, primary_key=True)
    domain = Column(String)

class TestSearchFilterBuilder(unittest.TestCase):
    def test_build_text_search_empty_query(self):
        filter_clause = SearchFilterBuilder.build_text_search(SampleModel, "", ["name", "domain"])
        self.assertIsNone(filter_clause)

    def test_build_text_search_empty_fields(self):
        filter_clause = SearchFilterBuilder.build_text_search(SampleModel, "tech", [])
        self.assertIsNone(filter_clause)

    def test_build_text_search_valid(self):
        filter_clause = SearchFilterBuilder.build_text_search(SampleModel, "acme", ["name", "domain"])
        self.assertIsNotNone(filter_clause)

if __name__ == "__main__":
    unittest.main()
