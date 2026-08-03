from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import time
import os
import random
import requests

class DiscoveryProviderInterface(ABC):
    @abstractmethod
    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False) -> List[Dict[str, Any]]:
        """
        Executes a search and returns a list of dictionaries containing business details.
        """
        pass

class MockDiscoveryProvider(DiscoveryProviderInterface):
    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False) -> List[Dict[str, Any]]:
        time.sleep(1.5) # Simulate latency
        
        # Name prefixes & suffixes for realistic mock business names
        prefixes = ["Apex", "Grand", "Horizon", "Summit", "Beacon", "Pinnacle", "Vanguard", "Crestview", "Sterling", "Nexus", "Atlas", "Crown", "Optima", "Prime", "Lumina"]
        suffixes = ["Center", "Group", "Hub", "Partners", "Services", "Solutions", "Plaza", "HQ", "Enterprise", "Suite"]
        
        results = []
        clean_type = business_type.strip().title()
        clean_loc = location.strip().title()
        
        for i in range(max_results):
            prefix = prefixes[i % len(prefixes)]
            suffix = suffixes[i % len(suffixes)]
            
            # Generate realistic business name
            if i % 3 == 0:
                name = f"{prefix} {clean_type} {suffix}"
            elif i % 3 == 1:
                name = f"{clean_loc} {clean_type} {suffix}"
            else:
                name = f"{prefix} {clean_type} of {clean_loc}"
                
            web_slug = name.lower().replace(" ", "").replace("&", "and").replace("'", "")
            domain = f"https://www.{web_slug}.com"
            
            results.append({
                "google_place_id": f"place_{i}_{int(time.time())}_{random.randint(1000, 9999)}",
                "name": name,
                "website": domain if (has_website or i % 5 != 4) else None,
                "rating": round(random.uniform(max(min_rating, 3.8), 4.9), 1),
                "review_count": random.randint(45, 380),
                "business_status": "OPERATIONAL",
                "latitude": -1.286389 + (i * 0.005),
                "longitude": 36.817223 + (i * 0.005),
                "address": f"{100 + (i * 12)} Commercial Way, {clean_loc}",
                "location": clean_loc,
                "discovery_source": "DiscoveryEngine"
            })
            
        return results

class GooglePlacesProvider(DiscoveryProviderInterface):
    def __init__(self):
        from core.config import settings
        self.api_key = settings.GOOGLE_PLACES_API_KEY
        
    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False) -> List[Dict[str, Any]]:
        if not self.api_key:
            raise ValueError("Google Places API key is missing. Please add GOOGLE_PLACES_API_KEY to your .env file.")
            
        query = f"{business_type} in {location}"
        url = "https://places.googleapis.com/v1/places:searchText"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.id,places.displayName,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.location,places.formattedAddress"
        }
        
        payload = {
            "textQuery": query,
            "minRating": min_rating,
        }
        
        results = []
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            
            # Handle specific API errors gracefully
            if response.status_code in [401, 403]:
                raise Exception("Google Places API authentication failed. Please check your API key and ensure the Places API (New) is enabled and billing is active.")
            elif response.status_code == 429:
                raise Exception("Google Places API quota exceeded. Please check your billing dashboard.")
            elif response.status_code >= 400:
                error_detail = response.json().get("error", {}).get("message", "Unknown error")
                raise Exception(f"Google API Error ({response.status_code}): {error_detail}")
                
            response.raise_for_status()
            data = response.json()
            
            places = data.get("places", [])
            
            for place in places:
                website = place.get("websiteUri")
                if has_website and not website:
                    continue
                    
                location_data = place.get("location", {})
                formatted_address = place.get("formattedAddress", location)
                results.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text", "Unknown Business"),
                    "website": website,
                    "rating": place.get("rating"),
                    "review_count": place.get("userRatingCount"),
                    "business_status": place.get("businessStatus"),
                    "latitude": location_data.get("latitude"),
                    "longitude": location_data.get("longitude"),
                    "address": formatted_address,
                    "location": formatted_address or location,
                    "discovery_source": "Google Places"
                })
                
                if len(results) >= max_results:
                    break
                    
        except requests.exceptions.RequestException as e:
            # Catch network errors specifically
            raise Exception(f"Network error when calling Google Places API: {str(e)}")
            
        return results
