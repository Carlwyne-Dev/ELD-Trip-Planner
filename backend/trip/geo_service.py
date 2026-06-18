import requests

def geocode_location(location_name):
    """
    Returns (lat, lng, label)
    """
    url = f"https://nominatim.openstreetmap.org/search?q={location_name}&format=json&limit=1"
    headers = {"User-Agent": "ELD-Planner-App"}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200 and len(response.json()) > 0:
            data = response.json()[0]
            label = data.get('display_name', location_name).split(',')[0]
            return float(data['lat']), float(data['lon']), label
    except Exception:
        pass

    # Mock fallback
    loc = location_name.lower()
    if 'chicago' in loc: return 41.8781, -87.6298, location_name
    if 'st. louis' in loc: return 38.6270, -90.1994, location_name
    if 'dallas' in loc: return 32.7767, -96.7970, location_name
    if 'springfield' in loc: return 39.7817, -89.6501, location_name
    return 0, 0, location_name

def get_route(waypoints):
    """
    waypoints: list of [lng, lat]
    Returns total_miles, driving_hours, polyline, leg_distances
    """
    import time, math

    coords = ";".join([f"{w[0]},{w[1]}" for w in waypoints])

    # Try OSRM
    osrm_url = (
        f"https://router.project-osrm.org/route/v1/driving/{coords}"
        f"?overview=full&geometries=geojson"
    )

    for attempt in range(3):
        try:
            response = requests.get(osrm_url, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get('routes'):
                    route = data['routes'][0]
                    total_miles   = route['distance'] * 0.000621371
                    driving_hours = route['duration'] / 3600.0
                    polyline      = route['geometry']['coordinates']
                    leg_distances = [leg['distance'] * 0.000621371 for leg in route.get('legs', [])]
                    print(f"[OSRM] Got {len(polyline)} polyline points, {total_miles:.0f} miles")
                    return total_miles, driving_hours, polyline, leg_distances
            else:
                print(f"[OSRM] Attempt {attempt+1} failed with status {response.status_code}")
        except Exception as e:
            print(f"[OSRM] Attempt {attempt+1} failed: {e}")
        time.sleep(1)

    # Fallback: straight-line estimate with gentle curve
    print("[OSRM] Using fallback route after 3 attempts")
    fallback_poly = []
    total_miles   = 0
    leg_distances = []
    for i in range(len(waypoints) - 1):
        a, b = waypoints[i], waypoints[i + 1]
        dx = b[0] - a[0]
        dy = b[1] - a[1]
        seg_miles = math.sqrt(dx**2 + dy**2) * 69.0
        leg_distances.append(seg_miles)
        total_miles += seg_miles
        for t in range(31):
            frac = t / 30.0
            perp = math.sin(frac * math.pi) * 0.3
            lng  = a[0] + dx * frac - dy * perp / max(abs(dx) + abs(dy), 0.01)
            lat  = a[1] + dy * frac + dx * perp / max(abs(dx) + abs(dy), 0.01)
            fallback_poly.append([lng, lat])
    driving_hours = total_miles / 60.0
    return total_miles, driving_hours, fallback_poly, leg_distances
