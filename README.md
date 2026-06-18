# ELD Trip Planner

A full-stack web application that automatically generates FMCSA-compliant Hours of Service (HOS) trip plans for truck drivers — including a live route map with stops and pixel-accurate ELD Daily Log Sheets.

Built as a developer assessment project.

---

## Features

- **HOS Trip Calculator** — Enforces all FMCSA property-carrying driver rules:
  - 11-hour driving limit per shift
  - 14-hour on-duty window
  - 10-hour mandatory rest between shifts
  - 30-minute break after 8 cumulative driving hours
  - 70-hour / 8-day cycle limit with 34-hour restart
  - Fuel stop every 1,000 miles

- **Route Map** — Interactive MapLibre GL map with 2D/3D toggle showing the full route, fuel stops, rest stops, and 30-min break locations with clickable popups

- **ELD Log Sheets** — Canvas-rendered daily log sheets matching the official FMCSA paper format: 24-hour grid, 15-minute increments, 4 duty status rows, remarks section, and hour totals

- **Dark Mode** — Toggle with localStorage persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Map | MapLibre GL JS via react-map-gl |
| Map Tiles | OpenFreeMap (no API key) |
| Routing | OSRM (open-source, no API key) |
| Log Rendering | HTML Canvas |
| Backend | Django + Django REST Framework |
| Geocoding | Nominatim (OpenStreetMap) |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API

**POST** `/api/trip/`

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 0
}
```

Returns a trip summary, route polyline with waypoints, and full ELD log day segments.

---

## Test Cases

| # | Route | Cycle Hours | Expected |
|---|---|---|---|
| 1 | Richmond, VA → Newark, NJ | 0 | Single day, ~325 mi |
| 2 | Chicago, IL → Dallas, TX | 0 | 2 days, midnight crossing |
| 3 | Los Angeles, CA → Phoenix, AZ | 65 | 34-hr cycle restart triggered |

---

## Project Structure

```
├── backend/
│   ├── trip/
│   │   ├── views.py           # POST /api/trip/
│   │   ├── hos_calculator.py  # All FMCSA HOS logic
│   │   ├── geo_service.py     # Geocoding + OSRM routing
│   │   └── serializers.py     # Input validation
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/
        │   ├── RouteMap.jsx    # MapLibre map + markers
        │   ├── LogSheet.jsx    # Log sheet tabs
        │   ├── LogCanvas.jsx   # Canvas ELD renderer
        │   └── TripForm.jsx    # Input form
        └── App.jsx
```

---

## Author

Carlwyne Maghari
