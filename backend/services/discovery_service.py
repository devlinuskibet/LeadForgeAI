import time
import os
import hashlib
import json
from services.discovery_provider import MockDiscoveryProvider, GooglePlacesProvider, DiscoveryProviderInterface

MEM_DISCOVERY_STATS = {"requests_made": 0, "cache_hits": 0, "cache_misses": 0, "total_time": 0.0}

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
        """
        cache_key_str = f"{business_type}|{location}|{max_results}|{min_rating}|{has_website}"
        cache_key = f"discovery_cache:{hashlib.md5(cache_key_str.encode()).hexdigest()}"
        
        import redis
        import time
        start_time = time.time()
        MEM_DISCOVERY_STATS["requests_made"] += 1
        
        try:
            r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_connect_timeout=0.5)
            r.incr("discovery_stats:requests_made")
            
            cached_data = r.get(cache_key)
            if cached_data:
                r.incr("discovery_stats:cache_hits")
                MEM_DISCOVERY_STATS["cache_hits"] += 1
                duration = time.time() - start_time
                MEM_DISCOVERY_STATS["total_time"] += duration
                r.hset("discovery_stats:timing", "last", duration)
                total_time = float(r.get("discovery_stats:total_time") or 0) + duration
                r.set("discovery_stats:total_time", total_time)
                return json.loads(cached_data)
                
            r.incr("discovery_stats:cache_misses")
            MEM_DISCOVERY_STATS["cache_misses"] += 1
        except Exception:
            r = None
            MEM_DISCOVERY_STATS["cache_misses"] += 1
            
        results = self.provider.search_businesses(
            business_type=business_type,
            location=location,
            max_results=max_results,
            min_rating=min_rating,
            has_website=has_website
        )
        
        duration = time.time() - start_time
        MEM_DISCOVERY_STATS["total_time"] += duration
        
        # Save to cache for 24 hours (86400 seconds)
        if r and results:
            try:
                r.setex(cache_key, 86400, json.dumps(results))
                r.hset("discovery_stats:timing", "last", duration)
                total_time = float(r.get("discovery_stats:total_time") or 0) + duration
                r.set("discovery_stats:total_time", total_time)
            except Exception:
                pass
                
        return results

