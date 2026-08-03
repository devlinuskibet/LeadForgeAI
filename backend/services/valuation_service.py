import json
import os
import random
from typing import Dict, Any, List

class ValuationService:
    """
    Modular Valuation Engine that calculates realistic deal revenue estimates (in KES / local currency)
    based on externalized pricing profiles, location tiers, business categories, and digital footprint gaps.
    """
    def __init__(self, profile_name: str = None):
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "pricing_profiles.json")
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                self.config_data = json.load(f)
        except Exception as err:
            # Fallback default configuration
            self.config_data = {
                "default_profile": "kenya_kes",
                "profiles": {
                    "kenya_kes": {
                        "currency_code": "KES",
                        "currency_symbol": "KES ",
                        "location_tiers": {
                            "tier_1_keywords": ["nairobi", "westlands", "kilimani", "nyali"],
                            "tier_1_multiplier": 1.5,
                            "tier_2_keywords": ["nakuru", "eldoret", "kisumu", "thika"],
                            "tier_2_multiplier": 1.1,
                            "tier_3_default_multiplier": 0.85
                        },
                        "category_base_rates": {
                            "high_value_keywords": ["hospital", "clinic", "law", "engineering"],
                            "high_value_base_kes": 150000,
                            "mid_tier_keywords": ["school", "college", "auto", "hotel"],
                            "mid_tier_base_kes": 85000,
                            "local_trade_default_base_kes": 35000
                        }
                    }
                }
            }
            
        selected_profile = profile_name or self.config_data.get("default_profile", "kenya_kes")
        self.profile = self.config_data.get("profiles", {}).get(selected_profile) or self.config_data.get("profiles", {}).get("kenya_kes")

    def _get_location_multiplier(self, location: str) -> float:
        if not location:
            return self.profile["location_tiers"].get("tier_3_default_multiplier", 0.85)
            
        loc_lower = location.lower()
        t1_keywords = self.profile["location_tiers"].get("tier_1_keywords", [])
        if any(k in loc_lower for k in t1_keywords):
            return self.profile["location_tiers"].get("tier_1_multiplier", 1.5)
            
        t2_keywords = self.profile["location_tiers"].get("tier_2_keywords", [])
        if any(k in loc_lower for k in t2_keywords):
            return self.profile["location_tiers"].get("tier_2_multiplier", 1.1)
            
        return self.profile["location_tiers"].get("tier_3_default_multiplier", 0.85)

    def _get_category_base_rate(self, business_type: str) -> int:
        if not business_type:
            return self.profile["category_base_rates"].get("local_trade_default_base_kes", 35000)
            
        btype_lower = business_type.lower()
        high_keywords = self.profile["category_base_rates"].get("high_value_keywords", [])
        if any(k in btype_lower for k in high_keywords):
            return self.profile["category_base_rates"].get("high_value_base_kes", 150000)
            
        mid_keywords = self.profile["category_base_rates"].get("mid_tier_keywords", [])
        if any(k in btype_lower for k in mid_keywords):
            return self.profile["category_base_rates"].get("mid_tier_base_kes", 85000)
            
        return self.profile["category_base_rates"].get("local_trade_default_base_kes", 35000)

    def calculate_valuation(
        self, 
        business_type: str, 
        location: str, 
        has_website: bool = True, 
        rating: float = 4.0, 
        review_count: int = 50
    ) -> Dict[str, Any]:
        """
        Calculates realistic contract deal revenue (in KES), opportunity score, priority score, 
        and solution packages tailored to the prospect.
        """
        loc_mult = self._get_location_multiplier(location)
        base_rate = self._get_category_base_rate(business_type)
        
        # Digital gap evaluation
        gap_multiplier = 1.0
        inferred_problems = []
        recommended_solutions = []
        
        symbol = self.profile.get("currency_symbol", "KES ")
        
        if not has_website:
            gap_multiplier += 0.35
            inferred_problems.append("No official website or mobile booking channel")
            pkg_price = int(35000 * loc_mult)
            recommended_solutions.append({"name": "WhatsApp Lead Capture & Web Suite", "price": f"{symbol}{pkg_price:,}"})
        else:
            inferred_problems.append("Website lacks instant AI lead qualification bot")
            
        if review_count < 30 or rating < 4.2:
            gap_multiplier += 0.25
            inferred_problems.append("Under-optimized Google review rating and local SEO presence")
            pkg_price = int(25000 * loc_mult)
            recommended_solutions.append({"name": "Google Review & Local SEO Booster", "price": f"{symbol}{pkg_price:,}"})

        # Core CRM Copilot solution
        crm_price = int(45000 * loc_mult)
        recommended_solutions.append({"name": "LeadForge CRM & Email Sales Copilot", "price": f"{symbol}{crm_price:,}"})

        # Calculate final estimated deal value in KES
        raw_val = base_rate * loc_mult * gap_multiplier
        # Add slight realistic variance (+/- 10%)
        hash_seed = hash(f"{business_type}{location}") % 100
        variance = 0.90 + (hash_seed / 500.0)
        final_kes = int(round(raw_val * variance, -3)) # Round to nearest thousand KES

        # Opportunity Score calculation (0-100)
        base_opp = 65
        if not has_website:
            base_opp += 20
        if rating < 4.0:
            base_opp += 10
        if loc_mult >= 1.4:
            base_opp += 5
        opp_score = min(98, max(50, base_opp))
        priority_score = min(99, opp_score + (5 if loc_mult >= 1.4 else 2))

        return {
            "estimated_value_kes": final_kes,
            "currency_code": self.profile.get("currency_code", "KES"),
            "currency_symbol": symbol,
            "opportunity_score": opp_score,
            "priority_score": priority_score,
            "location_multiplier": loc_mult,
            "inferred_problems": inferred_problems,
            "recommended_solutions": recommended_solutions,
            "sales_coach_advice": f"Target account in {location or 'Kenya'}. High ROI potential by pitching {recommended_solutions[0]['name']}.",
            "why_today": "High local demand with competitor digital adoption in the area."
        }
