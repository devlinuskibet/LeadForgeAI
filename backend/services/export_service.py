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
            str(getattr(ct, "company_id", "")),
            str(getattr(ct, "created_at", ""))
        ])
        
    return output.getvalue()

from models.email_message import EmailMessage

def export_email_messages_to_csv(emails: List[EmailMessage]) -> str:
    """
    Serializes a list of EmailMessage objects into CSV string content with engagement tracking.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Subject", "Sender", "Recipients", "Status", 
        "Sent At", "Opened At", "Replied At", "Provider Name", "Provider Message ID"
    ])
    
    for email in emails:
        writer.writerow([
            str(getattr(email, "id", "")),
            getattr(email, "subject", ""),
            getattr(email, "sender", ""),
            ", ".join(getattr(email, "recipients", []) or []),
            getattr(email, "status", ""),
            str(getattr(email, "sent_at", "") or ""),
            str(getattr(email, "opened_at", "") or ""),
            str(getattr(email, "replied_at", "") or ""),
            getattr(email, "provider_name", ""),
            getattr(email, "provider_message_id", "")
        ])
        
    return output.getvalue()
