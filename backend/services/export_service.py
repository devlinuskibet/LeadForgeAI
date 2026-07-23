import csv
import io
from typing import List
from models.company import Company
from models.contact import Contact

def export_companies_to_csv(companies: List[Company]) -> str:
    """
    Serializes a list of Company objects into CSV string content.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Name", "Domain", "Industry", "Employee Count", 
        "City", "State", "Country", "Website", "Created At"
    ])
    
    for c in companies:
        writer.writerow([
            getattr(c, "id", ""),
            getattr(c, "name", ""),
            getattr(c, "domain", ""),
            getattr(c, "industry", ""),
            getattr(c, "employee_count", ""),
            getattr(c, "city", ""),
            getattr(c, "state", ""),
            getattr(c, "country", ""),
            getattr(c, "website", ""),
            str(getattr(c, "created_at", ""))
        ])
        
    return output.getvalue()

def export_contacts_to_csv(contacts: List[Contact]) -> str:
    """
    Serializes a list of Contact objects into CSV string content.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "First Name", "Last Name", "Email", "Phone", 
        "Title", "Company ID", "Created At"
    ])
    
    for ct in contacts:
        writer.writerow([
            getattr(ct, "id", ""),
            getattr(ct, "first_name", ""),
            getattr(ct, "last_name", ""),
            getattr(ct, "email", ""),
            getattr(ct, "phone", ""),
            getattr(ct, "title", ""),
            getattr(ct, "company_id", ""),
            str(getattr(ct, "created_at", ""))
        ])
        
    return output.getvalue()
