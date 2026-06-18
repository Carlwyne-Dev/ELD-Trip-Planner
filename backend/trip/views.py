from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripRequestSerializer
from .geo_service import geocode_location, get_route
from .hos_calculator import calculate_hos

class TripView(APIView):
    def post(self, request):  # << [4] POST /api/trip/ — the one endpoint
        serializer = TripRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": list(serializer.errors.values())[0][0]}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # 1. Geocode all three locations
        curr_lat, curr_lng, curr_lbl = geocode_location(data['current_location'])
        pick_lat, pick_lng, pick_lbl = geocode_location(data['pickup_location'])
        drop_lat, drop_lng, drop_lbl = geocode_location(data['dropoff_location'])

        def same_coords(a_lat, a_lng, b_lat, b_lng):
            return abs(a_lat - b_lat) < 0.001 and abs(a_lng - b_lng) < 0.001

        curr_eq_pick = same_coords(curr_lat, curr_lng, pick_lat, pick_lng)
        curr_eq_drop = same_coords(curr_lat, curr_lng, drop_lat, drop_lng)
        pick_eq_drop = same_coords(pick_lat, pick_lng, drop_lat, drop_lng)

        # 2. Build deduplicated routing waypoints
        route_waypoints = [[curr_lng, curr_lat]]
        if not curr_eq_pick:
            route_waypoints.append([pick_lng, pick_lat])
        if not curr_eq_drop and not pick_eq_drop:
            route_waypoints.append([drop_lng, drop_lat])
        elif not curr_eq_drop:
            route_waypoints.append([drop_lng, drop_lat])

        # Inject highway corridor waypoints for N->S travel
        final_lat = drop_lat
        final_lng = drop_lng
        origin_lat = curr_lat
        origin_lng = curr_lng

        # North-to-South through Arkansas / central US: force I-30 near Little Rock
        going_south = origin_lat > 36.0 and final_lat < 35.0
        central_lng_band = -97.0 < final_lng < -90.0 and -97.0 < origin_lng < -82.0
        if going_south and central_lng_band and len(route_waypoints) == 2:
            # Insert I-30 at Little Rock as an intermediate snap point
            i30_lr = [-92.3341, 34.7465]  # I-30 at Little Rock, AR
            route_waypoints = [route_waypoints[0], i30_lr, route_waypoints[1]]
            print("[Route] Injected I-30 Little Rock waypoint for N->S corridor")

        # 3. Get route
        total_miles, driving_hours, polyline, leg_distances = get_route(route_waypoints)

        if curr_eq_pick and curr_eq_drop:
            leg_dist = [0.0, 0.0]
        elif curr_eq_pick:
            leg_dist = [0.0, sum(leg_distances)]
        elif pick_eq_drop:
            leg_dist = [sum(leg_distances), 0.0]
        else:
            # First leg is to pickup, the rest are from pickup to dropoff
            leg_dist = [
                leg_distances[0] if len(leg_distances) > 0 else 0.0,
                sum(leg_distances[1:]) if len(leg_distances) > 1 else 0.0
            ]

        # 4. Calculate HOS
        summary, log_days = calculate_hos(
            data['current_location'],
            data['pickup_location'],
            data['dropoff_location'],
            data['current_cycle_used'],
            total_miles,
            driving_hours,
            leg_dist
        )

        # 5. Display pins: offset duplicates so all 3 remain individually visible
        display_curr_lat, display_curr_lng = curr_lat, curr_lng
        display_pick_lat, display_pick_lng = pick_lat, pick_lng
        display_drop_lat, display_drop_lng = drop_lat, drop_lng

        if curr_eq_pick:
            display_pick_lat += 0.008   # ~0.5mi NW
            display_pick_lng -= 0.004

        if curr_eq_drop:
            display_drop_lat += 0.008   # ~0.5mi NE
            display_drop_lng += 0.004

        # Handle same-city edge case
        if same_coords(display_pick_lat, display_pick_lng, display_drop_lat, display_drop_lng):
            display_drop_lat += 0.010
            display_drop_lng += 0.005

        # Build display waypoints
        display_waypoints = [
            {
                "lat": display_curr_lat,
                "lng": display_curr_lng,
                "label": f"{'Current + Pickup' if curr_eq_pick else 'Current'}: {curr_lbl}",
                "type": "start"
            }
        ]
        if not curr_eq_pick:
            display_waypoints.append({
                "lat": display_pick_lat,
                "lng": display_pick_lng,
                "label": f"Pickup: {pick_lbl}",
                "type": "pickup"
            })
        display_waypoints.append({
            "lat": display_drop_lat,
            "lng": display_drop_lng,
            "label": f"Dropoff: {drop_lbl}",
            "type": "dropoff"
        })

        route_data = {
            "waypoints": display_waypoints,
            "polyline": polyline
        }
        
        response_data = {
            "trip_summary": summary,
            "route": route_data,
            "log_days": log_days
        }
        
        return Response(response_data)
