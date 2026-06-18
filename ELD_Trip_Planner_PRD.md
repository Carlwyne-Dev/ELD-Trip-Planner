# Product Requirements Document
## ELD Trip Planner — Full Stack Developer Assessment
**Version:** 1.0  
**Author:** Carlwyne Maghari  
**Date:** June 2026  
**Stack:** Django + React  

---

## 1. Overview

### 1.1 Product Summary
ELD Trip Planner is a web application that takes a truck driver's trip details as inputs and automatically generates a compliant Hours of Service (HOS) trip plan — including a visual route map with stops and fully rendered ELD Daily Log Sheets — based on FMCSA regulations.

### 1.2 Problem Statement
Truck drivers and dispatchers manually calculate HOS compliance and hand-draw log sheets — a tedious, error-prone process. This tool automates the entire calculation and log generation in seconds.

### 1.3 Target Users
- **Primary:** Dispatchers planning multi-day trips for drivers
- **Secondary:** Drivers who self-manage their own scheduling and logs

### 1.4 Success Criteria (Assessment)
- Hosted live version passes accuracy testing
- Log sheets are visually accurate to real ELD paper format
- Map shows route, stops, and rest points
- UI/UX is polished enough to compensate for minor edge-case inaccuracies

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast, modern, component-based |
| Styling | Tailwind CSS | Utility-first, easy dark mode |
| Map Tiles | OpenFreeMap | Free, no API key, 3 styles available |
| Map Library | MapLibre GL JS | 3D buildings, terrain, smooth rendering |
| React Map | react-map-gl | React wrapper for MapLibre |
| Routing API | OpenRouteService | Free tier, returns distance + waypoints |
| Log Rendering | HTML Canvas | Pixel-precise ELD grid drawing |
| Backend | Django + Django REST Framework | Required by assessment |
| CORS | django-cors-headers | Allow React → Django requests |
| Hosting (FE) | Vercel | Free, instant deploy |
| Hosting (BE) | Render.com | Free Django hosting |

---

## 3. Features & Requirements

### 3.1 Core Features (Must Have)

#### F1 — Trip Input Form
- Current location (text, geocoded)
- Pickup location (text, geocoded)
- Dropoff location (text, geocoded)
- Current cycle hours used (number, 0–70)
- Submit button triggers full trip calculation

#### F2 — Route Map
- Renders after form submission
- Built with **MapLibre GL JS** via `react-map-gl`
- **2D / 3D toggle button** in map panel corner:
  - **2D mode** — flat top-down view, `positron` style (clean, easy to read)
  - **3D mode** — tilted perspective, `liberty` style, 3D buildings enabled on zoom 14+
- Draws a polyline route: current → pickup → dropoff
- Markers:
  - 🟢 Current location
  - 🔵 Pickup location
  - 🔴 Dropoff location
  - ⛽ Fuel stops (every 1,000 miles)
  - 🛏️ Rest stops (10-hour break locations)
  - ☕ 30-minute break locations
- Clicking a marker shows a popup: location name, activity, time
- Map auto-fits bounds to show full route on load
- Smooth fly-to animation when route loads
- In 3D mode: pitch set to 45°, bearing slightly angled for dramatic effect

#### F3 — HOS Trip Calculator (Backend)
Applies all FMCSA property-carrying driver rules:

| Rule | Value |
|---|---|
| Max driving per shift | 11 hours |
| On-duty window | 14 hours |
| Required rest between shifts | 10 hours off-duty |
| Break requirement | 30 min after 8 hrs driving |
| Cycle limit | 70 hrs / 8 days |
| Fuel stop interval | Every 1,000 miles |
| Pickup duration | 1 hour (on-duty not driving) |
| Dropoff duration | 1 hour (on-duty not driving) |
| Pre-trip inspection | 30 min on-duty not driving — start of EVERY shift |
| Post-trip inspection | 30 min on-duty not driving — end of EVERY shift |
| Adverse conditions | None assumed |

Output: ordered list of trip segments, each with:
- `status`: OFF_DUTY / SLEEPER_BERTH / DRIVING / ON_DUTY_NOT_DRIVING
- `start_time` / `end_time`
- `duration_hours`
- `location`
- `remarks` (e.g. "Pre-trip inspection", "Fueling", "30-min break")
- `day_number`

#### F4 — ELD Daily Log Sheets
- One Canvas-rendered log sheet per trip day
- Accurate 24-hour grid with 15-minute increment marks
- 4 status rows: Off Duty, Sleeper Berth, Driving, On Duty (Not Driving)
- Horizontal lines drawn per segment
- Vertical connectors on status changes
- Remarks section below grid with city/state + activity per change
- Hour totals per row (must sum to 24)
- Header: date, total miles driven that day
- Multiple sheets rendered for multi-day trips
- Scrollable log sheet panel

#### F5 — Dark Mode Toggle
- Toggle button in navbar
- Persists via localStorage
- Dark: deep charcoal background, amber/orange accents (trucker feel)
- Light: off-white, dark slate text, same amber accents

---

### 3.2 Nice-to-Have (Bonus)
- Print / save log sheets (window.print or canvas export to PNG)
- Loading skeleton while trip is being calculated
- Trip summary card (total miles, total days, total driving hours)

---

## 4. UI/UX Design

### 4.1 Design Language — "Highway Operator"
Rugged, functional, built-for-work. Not a SaaS dashboard. Feels like something you'd find mounted in a dispatch office.

**Palette:**
| Name | Hex | Usage |
|---|---|---|
| Asphalt | `#1A1A1A` | Dark mode background |
| Road Gray | `#2C2C2C` | Dark mode cards |
| Fog White | `#F5F4F0` | Light mode background |
| Slate | `#3D3D3D` | Light mode text |
| Amber | `#F59E0B` | Primary accent, CTAs, highlights |
| Hazard Orange | `#EA580C` | Warnings, violations |
| Mile Marker Green | `#16A34A` | Success, on-schedule |
| Faded Line | `#4B5563` | Borders, dividers |

**Typography:**
- Display: `Bebas Neue` (bold, condensed — highway signage feel)
- Body: `Inter` (clean, readable for data)
- Mono: `JetBrains Mono` (times, coordinates, log data)

**Signature Element:**
The ELD log canvas grid itself — drawn pixel-perfect to match the real paper form, with amber status lines on a dark grid. The most memorable part of the UI.

### 4.2 Layout

```
┌──────────────────────────────────────────────┐
│  NAVBAR: Logo | "ELD Trip Planner" | 🌙 Dark │
├──────────────────────────────────────────────┤
│                                              │
│  HERO: "Plan Your Route. Stay Compliant."    │
│                                              │
├───────────────────┬──────────────────────────┤
│                   │                          │
│   TRIP FORM       │      ROUTE MAP           │
│   (left panel)    │      (right panel)       │
│                   │      Leaflet map         │
│  Current Location │      with markers        │
│  Pickup Location  │                          │
│  Dropoff Location │                          │
│  Cycle Hours Used │                          │
│                   │                          │
│  [Plan My Trip]   │                          │
│                   │                          │
├───────────────────┴──────────────────────────┤
│  TRIP SUMMARY CARD                           │
│  Total Miles | Total Days | Hours Driven     │
├──────────────────────────────────────────────┤
│  ELD LOG SHEETS                              │
│  Day 1 [Canvas]  Day 2 [Canvas]  Day 3 ...   │
│  (horizontally scrollable tabs)              │
└──────────────────────────────────────────────┘
```

### 4.3 UX Rules
- Form inputs show example placeholder text (e.g. "Chicago, IL")
- Cycle hours input has min=0, max=70 with validation message
- Map panel shows a placeholder state before trip is planned ("Your route will appear here")
- Log sheets only appear after a successful trip calculation
- All errors show inline, never alert() popups
- Mobile responsive — form stacks above map on small screens
- Loading state on submit button: "Planning trip..." with spinner

---

## 5. API Design

### 5.1 Endpoint

```
POST /api/trip/
Content-Type: application/json
```

**Request Body:**
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 20.5
}
```

**Response Body:**
```json
{
  "trip_summary": {
    "total_miles": 847,
    "total_days": 2,
    "total_driving_hours": 15.5,
    "total_on_duty_hours": 17.5
  },
  "route": {
    "waypoints": [
      { "lat": 41.85, "lng": -87.65, "label": "Current Location", "type": "start" },
      { "lat": 38.62, "lng": -90.19, "label": "Pickup - St. Louis, MO", "type": "pickup" },
      { "lat": 32.77, "lng": -96.79, "label": "Dropoff - Dallas, TX", "type": "dropoff" },
      { "lat": 36.15, "lng": -95.99, "label": "Fuel Stop", "type": "fuel" },
      { "lat": 37.08, "lng": -94.51, "label": "Rest Stop", "type": "rest" }
    ]
  },
  "log_days": [
    {
      "day": 1,
      "date": "2026-06-16",
      "total_miles_driven": 472,
      "segments": [
        {
          "status": "ON_DUTY_NOT_DRIVING",
          "start_time": "06:00",
          "end_time": "07:00",
          "duration_hours": 1.0,
          "location": "Chicago, IL",
          "remarks": "Pre-trip inspection + Pickup"
        },
        {
          "status": "DRIVING",
          "start_time": "07:00",
          "end_time": "14:00",
          "duration_hours": 7.0,
          "location": "Chicago, IL",
          "remarks": "Driving"
        },
        {
          "status": "OFF_DUTY",
          "start_time": "14:00",
          "end_time": "14:30",
          "duration_hours": 0.5,
          "location": "Springfield, IL",
          "remarks": "30-min break"
        }
      ]
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "current_cycle_used must be between 0 and 70."
}
```

---

## 6. Security

| Concern | Solution |
|---|---|
| CORS | Whitelist only Vercel frontend domain in production |
| Input validation | DRF serializer validates all fields server-side |
| API key exposure | ORS API key stored in `.env`, never in frontend code |
| Rate limiting | Django: limit to 60 requests/min per IP (use `django-ratelimit`) |
| XSS | React escapes output by default; no dangerouslySetInnerHTML used |
| HTTPS | Enforced by Render (backend) and Vercel (frontend) |
| `.env` in git | `.env` added to `.gitignore` before first commit |
| No auth needed | App is stateless — no user accounts, no sensitive data stored |

---

## 7. SEO & Meta

Even though this is an assessment app, good meta tags show professionalism:

```html
<title>ELD Trip Planner — HOS Compliant Route & Log Generator</title>
<meta name="description" content="Plan truck driver routes and auto-generate FMCSA-compliant ELD daily log sheets in seconds." />
<meta property="og:title" content="ELD Trip Planner" />
<meta property="og:description" content="HOS-compliant trip planning and ELD log generation for truck drivers." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 8. Performance

- React code-split by route (Vite handles this)
- Map tiles load lazily (Leaflet default)
- Canvas log sheets render only when visible (tab is active)
- Backend response target: under 3 seconds for any trip
- No database queries — pure in-memory calculation

---

## 9. File Structure (Final)

```
eld-trip-planner/
│
├── backend/
│   ├── backend/
│   │   ├── settings.py         # CORS, installed apps, env vars
│   │   ├── urls.py             # Root URL config
│   │   └── wsgi.py
│   ├── trip/
│   │   ├── views.py            # TripView: POST /api/trip/
│   │   ├── urls.py             # URL routing
│   │   ├── serializers.py      # Input validation
│   │   ├── hos_calculator.py   # All HOS logic
│   │   └── geo_service.py      # OpenRouteService integration
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                    # ORS_API_KEY (gitignored)
│
└── frontend/
    ├── public/
    │   └── index.html          # Meta tags here
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Logo + dark mode toggle
    │   │   ├── TripForm.jsx        # 4 inputs + submit
    │   │   ├── RouteMap.jsx        # MapLibre GL map + 3D + style switcher
    │   │   ├── TripSummary.jsx     # Miles/days/hours card
    │   │   ├── LogSheet.jsx        # Tabs container for all days
    │   │   └── LogCanvas.jsx       # Single day canvas renderer
    │   ├── services/
    │   │   └── api.js              # Axios POST to Django
    │   ├── hooks/
    │   │   └── useDarkMode.js      # Dark mode + localStorage
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    └── package.json
```

---

## 10. Build Order & Time Estimate

| # | Task | File(s) | Est. Time |
|---|---|---|---|
| 1 | Django project setup + settings | `settings.py`, `requirements.txt` | 30 min |
| 2 | HOS calculator logic | `hos_calculator.py` | 3 hrs |
| 3 | Geo service (ORS API) | `geo_service.py` | 1 hr |
| 4 | API endpoint + serializer | `views.py`, `serializers.py`, `urls.py` | 1 hr |
| 5 | React project setup + Tailwind | `main.jsx`, `App.jsx`, `App.css` | 30 min |
| 6 | Navbar + dark mode | `Navbar.jsx`, `useDarkMode.js` | 45 min |
| 7 | Trip form | `TripForm.jsx` | 1 hr |
| 8 | Route map + 3D + style switcher | `RouteMap.jsx` | 2.5 hrs |
| 9 | ELD canvas renderer | `LogCanvas.jsx`, `LogSheet.jsx` | 3.5 hrs |
| 10 | Trip summary card | `TripSummary.jsx` | 30 min |
| 11 | Wire everything in App.jsx | `App.jsx`, `api.js` | 1 hr |
| 12 | Deploy backend to Render | — | 1 hr |
| 13 | Deploy frontend to Vercel | — | 30 min |
| 14 | Loom recording | — | 1 hr |
| | **TOTAL** | | **~17 hrs** |

---

## 11. Edge Cases the Calculator Must Handle

| Edge Case | Expected Behavior |
|---|---|
| Shift crosses midnight | Rest period splits across two log sheet pages — shown on both days |
| 30-min break cumulative | Tracks cumulative driving hours since last break reset, not consecutive |
| 14-hr window | Starts from pre-trip inspection (first on-duty activity), not from when driving starts |
| Cycle hours near 70 | If `current_cycle_used` + today's on-duty hours approaches 70, cap driving and force a 34-hr restart |
| Short trip (< 1 day) | Still generates one full log sheet with remaining hours as off-duty |
| Fuel stop mid-drive | Inserts 30-min ON_DUTY_NOT_DRIVING segment, resets no HOS clocks |
| Pre/post trip every day | Every shift starts with 30-min pre-trip and ends with 30-min post-trip inspection |

---

## 12. Test Cases (Verify Before Submitting)

These are grounded in the FMCSA PDF examples. Run all three through the live app before recording the Loom.

---

### Test Case 1 — Single Day Trip (Based on John Doe FMCSA Example)
**Input:**
- Current: Richmond, VA
- Pickup: Richmond, VA (same — driver starts at origin)
- Dropoff: Newark, NJ
- Cycle hours used: 0

**Expected log sheet (Day 1):**
| Time | Status | Remarks |
|---|---|---|
| Midnight–6:00am | Off Duty | — |
| 6:00–6:30am | On Duty Not Driving | Pre-trip inspection, Richmond VA |
| 6:30–7:30am | On Duty Not Driving | Pickup (1 hr), Richmond VA |
| 7:30–9:00am | Driving | — |
| 9:00–9:30am | On Duty Not Driving | Fueling, Fredericksburg VA |
| 9:30–Noon | Driving | — |
| Noon–1:00pm | Off Duty | 30-min break (8 cumulative hrs hit), Baltimore MD |
| 1:00–3:00pm | Driving | — |
| 3:00–3:30pm | On Duty Not Driving | Dropoff (split: 30min shown), Philadelphia PA |
| 3:30–4:00pm | Driving | — |
| 4:00–5:45pm | Sleeper Berth | Rest, Cherry Hill NJ |
| 5:45–7:00pm | Driving | — |
| 7:00–7:30pm | On Duty Not Driving | Post-trip inspection, Newark NJ |
| 7:30–Midnight | Off Duty | — |

**Row totals must sum to 24.**
**Key check:** 30-min break triggers after 8 cumulative driving hours. 14-hr window starts at 6:00am, so no driving after 8:00pm.

---

### Test Case 2 — Multi-Day Trip with Midnight Crossing
**Input:**
- Current: Chicago, IL
- Pickup: Chicago, IL
- Dropoff: Dallas, TX
- Cycle hours used: 0

**Approximate distance:** ~920 miles → needs 2 driving days

**Expected behavior:**
- Day 1: Driver starts at 6am, drives ~11hrs (with breaks), hits 10-hr rest around 9–10pm
- Rest period crosses midnight → appears on both Day 1 (9pm–midnight as sleeper) and Day 2 (midnight–7am as sleeper)
- Day 2: Resumes driving, completes dropoff, post-trip inspection
- Fuel stop inserted around mile 1,000 mark

**Key checks:**
- Two separate log sheet pages generated
- Sleeper berth time correctly split across midnight boundary
- Row totals on both pages = 24 hrs each
- 14-hr window resets after 10-hr rest

---

### Test Case 3 — Cycle Hours Near Limit
**Input:**
- Current: Los Angeles, CA
- Pickup: Los Angeles, CA
- Dropoff: Phoenix, AZ
- Cycle hours used: 65 (only 5 hrs remaining in 70-hr cycle)

**Approximate distance:** ~370 miles → normally ~6 hrs driving

**Expected behavior:**
- Driver only has 5 hrs of on-duty time available before hitting 70-hr limit
- Calculator must cap driving at the cycle limit
- After hitting 70 hrs, force a 34-hr restart (shown as off-duty/sleeper berth)
- Trip resumes after restart with full 70 hrs available
- Log sheet shows the cycle-limit stop with a remark

**Key check:** App does not crash or show wrong hours — it gracefully handles cycle exhaustion.

---

## 13. Loom Video Strategy (3–5 min)

Structure that will impress reviewers:

**0:00–0:30** — Open with the GitHub repo. Show the file structure briefly. Say: "The brain of this app is `hos_calculator.py` — let me show you how it works."

**0:30–1:30** — Walk through `hos_calculator.py`. Point out: cumulative break tracking, 14-hr window logic, midnight split, cycle hours deduction. Don't read the code — explain the logic in plain English.

**1:30–3:00** — Switch to the live app. Enter Test Case 2 (Chicago → Dallas, 0 cycle hours). Hit submit. Narrate what's happening: "You can see the route on the map with rest stops and fuel stops marked. Below that, two log sheets were generated — one for each day."

**3:00–4:00** — Zoom into the log sheet canvas. Point out: "The grid matches the official FMCSA paper format — 24-hour timeline, 15-minute increments, four duty status rows, remarks section with city and state at every status change. Row totals sum to 24."

**4:00–4:30** — Show dark mode toggle, mobile responsiveness, error handling (try submitting empty form).

**4:30–5:00** — Close with: "All HOS rules are enforced: 11-hour driving limit, 14-hour window, 30-minute cumulative break, 10-hour rest, 70-hour/8-day cycle, and fuel stops every 1,000 miles. No adverse conditions assumed per the assessment spec."

---

## 14. Definition of Done

- [ ] Form accepts all 4 inputs with validation
- [ ] Map renders with all marker types after submit
- [ ] HOS rules all enforced correctly (11hr, 14hr window, 30min break, 10hr rest, 70hr cycle, 1000mi fuel)
- [ ] ELD log sheets visually match paper log format
- [ ] Multiple log sheets generated for multi-day trips
- [ ] Row hours on each log sheet sum to 24
- [ ] Dark mode toggle works and persists
- [ ] No API keys exposed in frontend code
- [ ] Pre/post trip inspection segments on every shift
- [ ] Midnight crossing splits correctly across two log pages
- [ ] 30-min break triggers on cumulative (not consecutive) driving hours
- [ ] 14-hr window starts from first on-duty activity
- [ ] Cycle hours near 70 handled gracefully (34-hr restart inserted)
- [ ] All 3 test cases pass manual verification
- [ ] MapLibre GL rendering with OpenFreeMap tiles (no API key needed)
- [ ] 2D/3D toggle works — flat view and 3D buildings both render correctly
- [ ] App is live on Vercel + Render
- [ ] GitHub repo is public and clean
- [ ] Loom video follows the 5-section structure in Section 13
