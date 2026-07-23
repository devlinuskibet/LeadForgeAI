import unittest
from services.email_template_service import EmailTemplateService

class TestEmailTemplateService(unittest.TestCase):
    def setUp(self):
        self.service = EmailTemplateService()

    def test_render_with_full_context(self):
        template = "Hello {{ first_name }}, welcome to {{ company_name }}!"
        context = {"first_name": "Alice", "company_name": "Acme Corp"}
        result = self.service.render(template, context)
        self.assertEqual(result, "Hello Alice, welcome to Acme Corp!")

    def test_render_with_defaults(self):
        template = "Hi {{ first_name }}, your role is {{ role }}."
        context = {"first_name": "Bob"}
        defaults = {"role": "Valued Partner"}
        result = self.service.render(template, context, defaults)
        self.assertEqual(result, "Hi Bob, your role is Valued Partner.")

    def test_render_missing_variable(self):
        template = "Contact {{ email }} for details."
        result = self.service.render(template, {})
        self.assertEqual(result, "Contact [Missing: email] for details.")

    def test_extract_variables(self):
        template = "{{ greeting }} {{ first_name }}, welcome to {{ company_name }}. Bye {{ first_name }}!"
        vars_found = self.service.extract_variables(template)
        self.assertEqual(vars_found, ["greeting", "first_name", "company_name"])

if __name__ == "__main__":
    unittest.main()
