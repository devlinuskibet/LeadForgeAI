import unittest
from unittest.mock import MagicMock
from utils.search_filter import SearchFilterBuilder

class TestSearchFilterBuilder(unittest.TestCase):
    def test_build_text_search_empty_query(self):
        model = MagicMock()
        filter_clause = SearchFilterBuilder.build_text_search(model, "", ["name", "domain"])
        self.assertIsNone(filter_clause)

    def test_build_text_search_empty_fields(self):
        model = MagicMock()
        filter_clause = SearchFilterBuilder.build_text_search(model, "tech", [])
        self.assertIsNone(filter_clause)

    def test_build_text_search_valid(self):
        class MockModel:
            name = MagicMock()
            domain = MagicMock()

        filter_clause = SearchFilterBuilder.build_text_search(MockModel, "acme", ["name", "domain"])
        self.assertIsNotNone(filter_clause)

if __name__ == "__main__":
    unittest.main()
