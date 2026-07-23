from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from core.database import get_db
from models.company import Company
from models.contact import Contact
from services.export_service import export_companies_to_csv, export_contacts_to_csv

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/companies/csv")
def export_companies_csv(db: Session = Depends(get_db)):
    """
    Downloads companies dataset as CSV file.
    """
    companies = db.query(Company).all()
    csv_content = export_companies_to_csv(companies)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="leadforge_companies.csv"'}
    )

@router.get("/contacts/csv")
def export_contacts_csv(db: Session = Depends(get_db)):
    """
    Downloads contacts dataset as CSV file.
    """
    contacts = db.query(Contact).all()
    csv_content = export_contacts_to_csv(contacts)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="leadforge_contacts.csv"'}
    )
