from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import time
import os
import requests

class DiscoveryProviderInterface(ABC):
    @abstractmethod
    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False) -> List[Dict[str, Any]]:
        """
        Executes a search and returns a list of dictionaries containing:
        - google_place_id (str)
        - name (str)
        - website (str, optional)
        - rating (float, optional)
        - review_count (int, optional)
        - business_status (str, optional)
        - latitude (float, optional)
        - longitude (float, optional)
        - discovery_source (str)
        """
        pass

class MockDiscoveryProvider(DiscoveryProviderInterface):
    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False) -> List[Dict[str, Any]]:
        time.sleep(2) # Simulate latency
        
        results = []
        for i in range(min(3, max_results)):
            results.append({
                "google_place_id": f"mock_place_{i}_{int(time.time())}",
                "name": f"Mock {business_type} {i+1} in {location}",
                "website": f"https://www.mock{business_type.lower().replace(' ', '')}{i+1}.com" if has_website else None,
                "rating": 4.5,
                "review_count": 120 + i,
                "business_status": "OPERATIONAL",
                "latitude": 0.0,
                "longitude": 0.0,
                "discovery_source": "MockProvider"
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
            "X-Goog-FieldMask": "places.id,places.displayName,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.location"
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
                results.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text", "Unknown Business"),
                    "website": website,
                    "rating": place.get("rating"),
                    "review_count": place.get("userRatingCount"),
                    "business_status": place.get("businessStatus"),
                    "latitude": location_data.get("latitude"),
                    "longitude": location_data.get("longitude"),
                    "discovery_source": "Google Places"
                })
                
                if len(results) >= max_results:
                    break
                    
        except requests.exceptions.RequestException as e:
            # Catch network errors specifically
            raise Exception(f"Network error when calling Google Places API: {str(e)}")
            
        return results
