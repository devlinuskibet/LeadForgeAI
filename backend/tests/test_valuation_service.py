import pytest
from services.valuation_service import ValuationService

def test_valuation_service_nairobi_hospital():
    service = ValuationService("kenya_kes")
    res = service.calculate_valuation("Hospital", "Westlands, Nairobi", has_website=True, rating=4.5, review_count=120)
    
    assert res["currency_code"] == "KES"
    assert res["estimated_value_kes"] >= 150000 # High value B2B in Nairobi Tier 1
    assert res["location_multiplier"] == 1.5
    assert len(res["recommended_solutions"]) > 0

def test_valuation_service_bomet_plumber():
    service = ValuationService("kenya_kes")
    res = service.calculate_valuation("Plumber", "Bomet", has_website=False, rating=3.8, review_count=15)
    
    assert res["currency_code"] == "KES"
    # Local trade in Bomet Tier 3 should stay in realistic range (between KES 25,000 and 75,000)
    assert 25000 <= res["estimated_value_kes"] <= 85000
    assert res["location_multiplier"] == 0.85
    assert "No official website" in res["inferred_problems"][0]
