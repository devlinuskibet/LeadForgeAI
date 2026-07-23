import unittest
from utils.pagination import PaginationParams, PaginatedResponse

class TestPagination(unittest.TestCase):
    def test_pagination_params_offset(self):
        params = PaginationParams(page=1, page_size=10)
        self.assertEqual(params.offset, 0)
        
        params2 = PaginationParams(page=3, page_size=20)
        self.assertEqual(params2.offset, 40)

    def test_paginated_response_create(self):
        items = ["a", "b", "c"]
        params = PaginationParams(page=1, page_size=10)
        response = PaginatedResponse.create(items=items, total=25, params=params)

        self.assertEqual(response.total, 25)
        self.assertEqual(response.total_pages, 3)
        self.assertTrue(response.has_next)
        self.assertFalse(response.has_prev)

    def test_paginated_response_empty(self):
        params = PaginationParams(page=1, page_size=10)
        response = PaginatedResponse.create(items=[], total=0, params=params)

        self.assertEqual(response.total, 0)
        self.assertEqual(response.total_pages, 0)
        self.assertFalse(response.has_next)
        self.assertFalse(response.has_prev)

    def test_paginated_response_middle_page(self):
        params = PaginationParams(page=2, page_size=5)
        response = PaginatedResponse.create(items=[1, 2, 3, 4, 5], total=15, params=params)

        self.assertTrue(response.has_next)
        self.assertTrue(response.has_prev)

if __name__ == "__main__":
    unittest.main()
