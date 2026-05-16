"""
Central clinic registry client
Handles clinic registration and discovery
"""

import os
import json
import math
import httpx
from typing import List, Dict, Any, Optional
import uuid
import asyncio


REGISTRY_URL = os.getenv("REGISTRY_URL", "")
LOCAL_REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "clinics_registry.json")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula

    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def register_clinic(
    name: str,
    city: str,
    lat: float,
    lng: float,
    phone: str,
    public_url: str
) -> str:
    """
    Register clinic with central registry

    Returns clinic ID
    """
    clinic_id = str(uuid.uuid4())

    clinic_data = {
        "id": clinic_id,
        "name": name,
        "city": city,
        "lat": lat,
        "lng": lng,
        "phone": phone,
        "public_url": public_url,
        "registered_at": str(datetime.now())
    }

    # Store locally
    clinics = await _load_local_registry()
    clinics[clinic_id] = clinic_data
    await _save_local_registry(clinics)

    # Try to register with central registry if URL is configured
    if REGISTRY_URL:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                await client.post(
                    f"{REGISTRY_URL}/api/clinics",
                    json=clinic_data
                )
        except Exception as e:
            print(f"Failed to register with central registry: {e}")

    return clinic_id


async def get_nearby_clinics(
    lat: float,
    lng: float,
    radius_km: float = 20
) -> List[Dict[str, Any]]:
    """
    Get clinics within radius of given coordinates

    Returns list of clinics with distance
    """
    clinics = []

    # Load from local registry
    local_clinics = await _load_local_registry()
    for clinic_id, clinic in local_clinics.items():
        distance = haversine_distance(lat, lng, clinic["lat"], clinic["lng"])
        if distance <= radius_km:
            clinics.append({
                **clinic,
                "distance_km": round(distance, 2)
            })

    # Try to get from central registry if URL is configured
    if REGISTRY_URL:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{REGISTRY_URL}/api/clinics",
                    params={"lat": lat, "lon": lng, "radius": radius_km}
                )
                response.raise_for_status()
                remote_clinics = response.json()

                # Merge with local, avoiding duplicates
                existing_ids = {c["id"] for c in clinics}
                for clinic in remote_clinics:
                    if clinic["id"] not in existing_ids:
                        clinics.append(clinic)
        except Exception as e:
            print(f"Failed to get clinics from central registry: {e}")

    # Sort by distance
    clinics.sort(key=lambda c: c.get("distance_km", float("inf")))

    return clinics


def _read_registry_sync() -> Dict[str, Any]:
    """Synchronously read and parse the registry file"""
    try:
        with open(LOCAL_REGISTRY_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

async def _load_local_registry() -> Dict[str, Any]:
    """Load local registry from JSON file without blocking the event loop"""
    return await asyncio.to_thread(_read_registry_sync)


async def _save_local_registry(clinics: Dict[str, Any]):
    """Save local registry to JSON file"""
    with open(LOCAL_REGISTRY_FILE, "w") as f:
        json.dump(clinics, f, indent=2)


async def get_local_clinic() -> Optional[Dict[str, Any]]:
    """Get this clinic's info from local registry"""
    clinics = await _load_local_registry()
    if clinics:
        # Return the first (and only) clinic
        return next(iter(clinics.values()))
    return None


from datetime import datetime
