import time
import os
import hashlib
import json
from services.discovery_provider import MockDiscoveryProvider, GooglePlacesProvider, DiscoveryProviderInterface

class DiscoveryService:
    def __init__(self, use_mock: bool = False):
        from core.config import settings
        api_key = settings.GOOGLE_PLACES_API_KEY or os.environ.get("GOOGLE_PLACES_API_KEY")
        if use_mock or not api_key:
            self.provider: DiscoveryProviderInterface = MockDiscoveryProvider()
        else:
            self.provider: DiscoveryProviderInterface = GooglePlacesProvider()

    def search_businesses(self, business_type: str, location: str, max_results: int = 10, min_rating: float = 0.0, has_website: bool = False):
        """
        Orchestrates the discovery providers and returns a list of dictionaries containing business details.
        TODO: Add Redis caching here based on the hashed query parameters to save quota.
        """
        # Create a unique cache key based on search parameters
        cache_key_str = f"{business_type}|{location}|{max_results}|{min_rating}|{has_website}"
        cache_key = f"discovery_cache:{hashlib.md5(cache_key_str.encode()).hexdigest()}"
        
        # Redis caching
        import redis
        import time
        start_time = time.time()
        
        try:
            r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            r.incr("discovery_stats:requests_made")
            
            cached_data = r.get(cache_key)
            if cached_data:
                r.incr("discovery_stats:cache_hits")
                duration = time.time() - start_time
                r.hset("discovery_stats:timing", "last", duration)
                # Keep a running average (simplified)
                total_time = float(r.get("discovery_stats:total_time") or 0) + duration
                r.set("discovery_stats:total_time", total_time)
                return json.loads(cached_data)
                
            r.incr("discovery_stats:cache_misses")
        except Exception as e:
            print(f"Redis cache error: {e}")
            r = None
            
        results = self.provider.search_businesses(
            business_type=business_type,
            location=location,
            max_results=max_results,
            min_rating=min_rating,
            has_website=has_website
        )
        
        duration = time.time() - start_time
        
        # Save to cache for 24 hours (86400 seconds)
        if r and results:
            try:
                r.setex(cache_key, 86400, json.dumps(results))
                r.hset("discovery_stats:timing", "last", duration)
                total_time = float(r.get("discovery_stats:total_time") or 0) + duration
                r.set("discovery_stats:total_time", total_time)
            except Exception as e:
                print(f"Redis cache save error: {e}")
                
        return results

