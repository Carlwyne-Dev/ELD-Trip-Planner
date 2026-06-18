from datetime import datetime, timedelta

# FMCSA HOS Constants
MAX_DRIVING     = 11.0
MAX_ON_DUTY     = 14.0
REST_REQUIRED   = 10.0
BREAK_AFTER     = 8.0
BREAK_DUR       = 0.5
FUEL_INTERVAL   = 1000.0
PICKUP_DUR      = 1.0
DROPOFF_DUR     = 1.0
PRE_TRIP_DUR    = 0.5
POST_TRIP_DUR   = 0.5
CYCLE_LIMIT     = 70.0
RESTART_REQUIRED = 34.0

def _split_at_midnight(seg):
    """Split a segment dict at midnight boundaries. Returns a list of segments."""
    start = seg["start_dt"]
    end   = seg["end_dt"]

    results = []
    current = start
    while current < end:
        midnight = (current + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        chunk_end = min(end, midnight)
        dur = (chunk_end - current).total_seconds() / 3600.0
        results.append({
            "status":         seg["status"],
            "start_time":     current.strftime("%H:%M"),
            "end_time":       chunk_end.strftime("%H:%M") if chunk_end.hour != 0 or chunk_end.minute != 0 else "24:00",
            "duration_hours": round(dur, 2),
            "location":       seg["location"],
            "remarks":        seg["remarks"],
            "date":           current.strftime("%Y-%m-%d"),
            "distance_pct":   seg.get("distance_pct", 0.0),
        })
        current = chunk_end
    return results


def calculate_hos(current_location, pickup_location, dropoff_location,
                  cycle_used, total_miles, total_driving_hours, leg_dist):

    speed = (total_miles / total_driving_hours) if total_driving_hours > 0 else 55.0
    speed = max(45.0, min(speed, 65.0))

    # Trip start: today 00:00 (midnight)
    now = datetime(2026, 6, 16, 0, 0)

    # Mutable state
    state = dict(
        shift_driving  = 0.0,
        shift_elapsed  = 0.0,
        shift_started  = False,
        drive_since_break = 0.0,
        cycle_hours    = cycle_used,
        miles_remaining = total_miles,
        miles_since_fuel = 0.0,
        miles_driven   = 0.0,
        leg            = 0,           # 0 = heading to pickup, 1 = heading to dropoff
    )

    miles_in_leg = 0.0

    raw_segments = []   # flat list before day-splitting

    def loc_label():
        if state["leg"] == 0:
            pct = min(miles_in_leg / max(leg_dist[0], 1), 1.0)
            if pct < 0.25: return current_location
            if pct < 0.75: return f"En Route to {pickup_location}"
            return pickup_location
        else:
            pct = min((miles_in_leg - leg_dist[0]) / max(leg_dist[1], 1), 1.0)
            if pct < 0.25: return pickup_location
            if pct < 0.75: return f"En Route to {dropoff_location}"
            return dropoff_location

    def add(status, duration, location, remarks):
        nonlocal now
        duration = round(max(duration, 0.0), 4)
        if duration <= 0:
            return
        start_dt = now
        end_dt   = now + timedelta(hours=duration)
        
        pct = state["miles_driven"] / total_miles if total_miles > 0 else 0.0
        
        # Merge consecutive segments with the SAME status (ELD logs only record on status change)
        if raw_segments and raw_segments[-1]["status"] == status:
            raw_segments[-1]["end_dt"] = end_dt
            raw_segments[-1]["duration_hours"] = round(raw_segments[-1]["duration_hours"] + duration, 4)
            raw_segments[-1]["distance_pct"] = round(pct, 4)
        else:
            raw_segments.append({
                "status":         status,
                "start_dt":       start_dt,
                "end_dt":         end_dt,
                "duration_hours": duration,
                "location":       location,
                "remarks":        remarks,
                "distance_pct":   round(pct, 4)
            })
        now = end_dt
        if status != "OFF_DUTY" and status != "SLEEPER_BERTH":
            state["shift_started"] = True
            state["cycle_hours"]   += duration
            
        if state.get("shift_started"):
            state["shift_elapsed"] += duration
        if status == "DRIVING":
            state["shift_driving"]      += duration
            state["drive_since_break"]  += duration

    # Initial OFF_DUTY: midnight to shift start (00:00 -> 06:00)
    add("OFF_DUTY", 6.0, current_location, "Off Duty — Pre-shift")

    # Shift Start
    add("ON_DUTY_NOT_DRIVING", PRE_TRIP_DUR, current_location, "Pre-trip inspection")

    # Main driving loop
    MAX_ITER = 1000
    iterations = 0

    while state["miles_remaining"] > 0.01 and iterations < MAX_ITER:
        iterations += 1

        t_driving = MAX_DRIVING - state["shift_driving"]
        t_onduty  = MAX_ON_DUTY - state["shift_elapsed"] - POST_TRIP_DUR
        t_break   = BREAK_AFTER - state["drive_since_break"]
        t_cycle   = CYCLE_LIMIT - state["cycle_hours"] - POST_TRIP_DUR

        if min(t_driving, t_onduty) <= 0.01 or t_cycle <= 0.01:
            add("ON_DUTY_NOT_DRIVING", POST_TRIP_DUR, loc_label(), "Post-trip inspection")
            
            if state["cycle_hours"] >= CYCLE_LIMIT:
                add("OFF_DUTY", 2.0, loc_label(), "Off Duty — Evening")
                add("OFF_DUTY", RESTART_REQUIRED - 2.0, loc_label(), "34-hr cycle restart")
                state["cycle_hours"] = 0.0
            else:
                add("OFF_DUTY", 2.0, loc_label(), "Off Duty — Evening")
                add("SLEEPER_BERTH", REST_REQUIRED - 2.0, loc_label(), "10-hr mandatory rest")
                
            state["shift_driving"]    = 0.0
            state["shift_elapsed"]    = 0.0
            state["shift_started"]    = False
            state["drive_since_break"] = 0.0
            
            add("ON_DUTY_NOT_DRIVING", PRE_TRIP_DUR, loc_label(), "Pre-trip inspection")
            continue

        if t_break <= 0.01:
            add("OFF_DUTY", BREAK_DUR, loc_label(), "30-Min Rest Break")
            state["drive_since_break"] = 0.0
            continue

        max_drive = min(t_driving, t_onduty, t_break, t_cycle)

        # Miles we can cover
        m_fuel   = FUEL_INTERVAL - state["miles_since_fuel"]
        m_drive  = max_drive * speed
        step_m   = min(state["miles_remaining"], m_drive, m_fuel)

        # Cap step to not overshoot the pickup boundary
        if state["leg"] == 0:
            dist_to_pickup = max(0.0, leg_dist[0] - miles_in_leg)
            step_m = min(step_m, dist_to_pickup)

        if step_m <= 0.01:
            # If stuck in leg 0 with nothing to drive, force transition
            if state["leg"] == 0:
                state["leg"] = 1
                add("ON_DUTY_NOT_DRIVING", PICKUP_DUR, pickup_location, "Arrived at Pickup — Loading")
                continue
            else:
                break

        step_h = step_m / speed

        add("DRIVING", step_h, loc_label(), "Driving")
        state["miles_remaining"]  -= step_m
        state["miles_since_fuel"] += step_m
        state["miles_driven"]     += step_m
        miles_in_leg              += step_m

        # Fuel stop?
        if state["miles_since_fuel"] >= FUEL_INTERVAL:
            add("ON_DUTY_NOT_DRIVING", 0.5, loc_label(), "Fuel stop")
            state["miles_since_fuel"] = 0.0

        # Leg transition: arrived at pickup
        if state["leg"] == 0 and miles_in_leg >= leg_dist[0] - 0.01:
            state["leg"] = 1
            add("ON_DUTY_NOT_DRIVING", PICKUP_DUR, pickup_location, "Arrived at Pickup — Loading")

    # Dropoff
    add("ON_DUTY_NOT_DRIVING", DROPOFF_DUR, dropoff_location, "Arrived at Dropoff — Unloading")
    add("ON_DUTY_NOT_DRIVING", POST_TRIP_DUR, dropoff_location, "Post-trip inspection")

    # Pad final day with OFF_DUTY until midnight
    hours_since_midnight = now.hour + now.minute / 60.0 + now.second / 3600.0
    if hours_since_midnight > 0:
        time_to_midnight = 24.0 - hours_since_midnight
        add("OFF_DUTY", time_to_midnight, dropoff_location, "Off Duty — Post-trip")

    # Split segments at midnight
    all_segs = []
    for seg in raw_segments:
        all_segs.extend(_split_at_midnight(seg))

    # Group by date
    from collections import defaultdict
    days_map = defaultdict(list)
    for seg in all_segs:
        days_map[seg["date"]].append(seg)

    log_days = []
    for i, (date, segs) in enumerate(sorted(days_map.items())):
        # Skip empty days
        total_dur = sum(s["duration_hours"] for s in segs)
        if total_dur < 0.05:
            continue
        miles_today = sum(
            s["duration_hours"] * speed
            for s in segs if s["status"] == "DRIVING"
        )
        log_days.append({
            "day": i + 1,
            "date": date,
            "total_miles_driven": round(miles_today),
            "segments": segs,
        })

    # Re-number days sequentially after filtering
    for i, d in enumerate(log_days):
        d["day"] = i + 1

    driving_hours = sum(
        s["duration_hours"] for s in all_segs if s["status"] == "DRIVING"
    )
    on_duty_hours = sum(
        s["duration_hours"] for s in all_segs if s["status"] != "OFF_DUTY"
    )

    summary = {
        "total_miles":         round(total_miles),
        "total_days":          len(log_days),
        "total_driving_hours": round(driving_hours, 1),
        "total_on_duty_hours": round(on_duty_hours, 1),
        "origin":              current_location,
        "destination":         dropoff_location,
    }

    return summary, log_days
