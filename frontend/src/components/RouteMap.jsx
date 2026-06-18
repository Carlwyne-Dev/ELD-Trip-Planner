import React, { useEffect, useRef, useState, useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLES = {
    dark:     'https://tiles.openfreemap.org/styles/dark',
    positron: 'https://tiles.openfreemap.org/styles/positron',
    liberty:  'https://tiles.openfreemap.org/styles/liberty',
    bright:   'https://tiles.openfreemap.org/styles/bright',
};

const COLORS = {
    start: '#10B981', pickup: '#3B82F6', dropoff: '#EF4444',
    fuel: '#F59E0B', rest: '#8B5CF6', break: '#64748B', meal: '#F97316',
};

const LABELS = {
    start: 'Current Location', pickup: 'Pickup Point',
    dropoff: 'Dropoff Point', fuel: 'Fuel Stop',
    rest: '10-hr Rest', break: 'Rest Break', meal: 'Rest Break',
};

const Icon = ({ type }) => {
    switch(type) {
        case 'pickup':
            return (
                <g>
                    <path d="M2 4L8 1l6 3v8l-6 3-6-3Z" fill="none" stroke="white" strokeWidth="1.8"/>
                    <line x1="8" y1="7" x2="8" y2="15" stroke="white" strokeWidth="1.8"/>
                </g>
            );
        case 'dropoff':
            return (
                <g>
                    <line x1="3" y1="1" x2="3" y2="14" stroke="white" strokeWidth="2"/>
                    <path d="M3 2l9 3-9 3Z" fill="white"/>
                </g>
            );
        case 'fuel':
            return (
                <g>
                    <rect x="1" y="4" width="8" height="10" rx="1" fill="none" stroke="white" strokeWidth="1.8"/>
                    <rect x="3" y="6" width="4" height="2" rx="0.5" fill="white"/>
                    <path d="M9 4l3 1v4l1 1v2" stroke="white" strokeWidth="1.5" fill="none"/>
                </g>
            );
        case 'rest':
            return <path d="M13 9A6 6 0 1 1 6 2 5 5 0 0 0 13 9Z" fill="white"/>;
        case 'meal':
            return (
                <g>
                    <line x1="4" y1="2" x2="4" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8 2v4c0 2 4 2 4 0V2" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                    <line x1="10" y1="6" x2="10" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </g>
            );
        case 'break':
            return (
                <g>
                    <circle cx="8" cy="8" r="6" fill="none" stroke="white" strokeWidth="1.8"/>
                    <line x1="6" y1="5" x2="6" y2="11" stroke="white" strokeWidth="2"/>
                    <line x1="10" y1="5" x2="10" y2="11" stroke="white" strokeWidth="2"/>
                </g>
            );
        case 'start':
        default:
            return <circle cx="8" cy="8" r="4" fill="white"/>;
    }
};

function PinSvg({ color, type }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
            <defs>
                <filter id={`sh-${type}`}><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.55)"/></filter>
            </defs>
            <path d="M18 2C10.3 2 4 8.3 4 16c0 11 14 28 14 28s14-17 14-28C32 8.3 25.7 2 18 2Z"
                  fill={color} filter={`url(#sh-${type})`} stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
            <circle cx="18" cy="16" r="8" fill="rgba(0,0,0,0.18)"/>
            <g transform="translate(10,8)"><Icon type={type} /></g>
        </svg>
    );
}

// Marker with inline info-card transform
function SmartMarker({ id, lng, lat, type, label, loc, time, day, duration, activePin, setActivePin, isDark, snapIndex = 0, onSnap, onZoom, onLocUpdate, routePositions = [] }) {
    const [realName, setRealName] = useState(null);
    const [realLoc, setRealLoc] = useState(null);
    const [snappedCoords, setSnappedCoords] = useState(null);

    // Geocode POIs (gas stations, hotels) near the route
    useEffect(() => {
        if (type !== 'rest' && type !== 'fuel') return;
        
        let isMounted = true;
        let query = 'motel';
        if (type === 'fuel') query = 'gas+station';
        // 0.4 degrees is roughly a 25-30 mile box.
        const viewbox = `${lng - 0.4},${lat + 0.4},${lng + 0.4},${lat - 0.4}`;
        const delay = snapIndex * 1200;
        
        const timer = setTimeout(() => {
            // Use bounded=1 and limit=10 to find multiple options inside the box
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1`, {
                headers: { 'User-Agent': 'ELD-Planner-App' }
            })
            .then(res => res.json())
            .then(data => {
                if (isMounted && data && data.length > 0) {
                    // Find the closest station from the results
                    let closestObj = data[0];
                    let minDist = Infinity;
                    data.forEach(item => {
                        const itemLng = parseFloat(item.lon);
                        const itemLat = parseFloat(item.lat);
                        const dLat = (itemLat - lat) * Math.PI / 180;
                        const dLon = (itemLng - lng) * Math.PI / 180;
                        const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(itemLat*Math.PI/180) * Math.sin(dLon/2)**2;
                        const dist = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        if (dist < minDist) {
                            minDist = dist;
                            closestObj = item;
                        }
                    });

                    const foundName = closestObj.name || closestObj.display_name.split(',')[0];
                    const coords = { lng: parseFloat(closestObj.lon), lat: parseFloat(closestObj.lat) };
                    
                    const addr = closestObj.address || {};
                    const city = addr.city || addr.town || addr.village || addr.county || '';
                    const stateName = addr.state || '';
                    const fetchedLoc = (city && stateName) ? `${city}, ${stateName}` : foundName;
                    if (onLocUpdate) onLocUpdate(day, time, fetchedLoc);
                    
                    // Reject if Nominatim ignored bounding box and returned something >45 miles away
                    const R = 3958.8;
                    const dLat = (coords.lat - lat) * Math.PI / 180;
                    const dLon = (coords.lng - lng) * Math.PI / 180;
                    const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(coords.lat*Math.PI/180) * Math.sin(dLon/2)**2;
                    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    
                    // Allow up to 100 miles detour in the desert
                    if (dist < 100) {
                        // Step 1: Snap the highway point to actual road network
                        // Step 2: Route from that snapped road point to the amenity only
                        // (We don't include a rejoin point — the dashed line should only show the detour exit, not the return)
                        const nearestUrl = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`;
                        fetch(nearestUrl)
                        .then(r => r.json())
                        .then(nearestData => {
                            const snapped = nearestData?.waypoints?.[0]?.location ?? [lng, lat];

                            // Only route from highway snap point → amenity (2 points, clean detour exit line)
                            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${snapped[0]},${snapped[1]};${coords.lng},${coords.lat}?overview=full&geometries=geojson`;
                            
                            return fetch(osrmUrl);
                        })
                        .then(osrmRes => osrmRes.json())
                        .then(osrmData => {
                            let detourPolyline = null;
                            if (isMounted && osrmData?.routes?.length > 0) {
                                detourPolyline = osrmData.routes[0].geometry.coordinates;
                            }
                            if (isMounted) {
                                setRealName(foundName);
                                setRealLoc(fetchedLoc);
                                setSnappedCoords(coords);
                                if (onSnap) onSnap(id, { ...coords, detourPolyline }, foundName);
                            }
                        })
                        .catch(err => {
                            console.error("OSRM routing error:", err);
                            // Fallback to L-shape
                            const detourPolyline = [[lng, lat], [coords.lng, lat], [coords.lng, coords.lat]];
                            if (isMounted) {
                                setRealName(foundName);
                                setRealLoc(fetchedLoc);
                                setSnappedCoords(coords);
                                if (onSnap) onSnap(id, { ...coords, detourPolyline }, foundName);
                            }
                        });
                    }
                } else if (isMounted) {
                    // Fallback: If no amenity found within 45mi, reverse geocode the exact highway coordinates!
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(r => r.json())
                    .then(rev => {
                        if (isMounted && rev && rev.address) {
                            const c = rev.address.city || rev.address.town || rev.address.village || rev.address.county || '';
                            const s = rev.address.state || '';
                            const fallbackLoc = (c && s) ? `${c}, ${s}` : 'Highway Route';
                            setRealLoc(fallbackLoc);
                            if (onLocUpdate) onLocUpdate(day, time, fallbackLoc);
                        }
                    })
                    .catch(() => {});
                }
            })
            .catch(e => console.error("Snap error:", e));
        }, delay);
        
        return () => { isMounted = false; clearTimeout(timer); };
    }, [lng, lat, type, snapIndex, id]);

    const isOpen = activePin === id;
    const color = COLORS[type] || '#555';
    
    const displayLng = snappedCoords ? snappedCoords.lng : lng;
    const displayLat = snappedCoords ? snappedCoords.lat : lat;
    
    let displayLabel = label;
    const snappable = (type === 'rest' || type === 'fuel' || type === 'meal');
    if (snappable && realName) {
        displayLabel = realName;
    }
    
    // Theme colors
    const bg = isDark ? '#141414' : '#ffffff';
    const textMain = isDark ? '#fff' : '#111';
    const textSub = isDark ? '#bbb' : '#555';
    const border = isDark ? '#1f1f1f' : '#f1f5f9';
    const shadow = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.15)';

    return (
        <Marker longitude={displayLng} latitude={displayLat} anchor="bottom" style={{ zIndex: isOpen ? 50 : 1 }}>
            <div
                onClick={(e) => { e.stopPropagation(); setActivePin(isOpen ? null : id); }}
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {isOpen ? (
                    <div style={{
                        background: bg,
                        border: `1px solid ${color}44`,
                        borderTop: `3px solid ${color}`,
                        borderRadius: 10,
                        minWidth: 210,
                        boxShadow: `0 12px 40px ${shadow}, 0 0 0 1px ${color}22`,
                        animation: 'card-bloom 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                        transformOrigin: 'bottom center',
                        zIndex: 10,
                        position: 'relative',
                        marginBottom: 4, // Lift slightly so tail points at the exact spot
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: color + (isDark ? '18' : '11'), padding: '10px 14px 8px', borderBottom: `1px solid ${border}`, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <div style={{ paddingRight: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: textMain, fontFamily: 'Inter, sans-serif', letterSpacing: 0.3 }}>{displayLabel}</div>
                                <div style={{ fontSize: 10, color: color, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{LABELS[type] || type}</div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); if (onZoom) onZoom(displayLng, displayLat); }}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    border: `1px solid ${color}55`,
                                    borderRadius: 4,
                                    color: textMain,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    textTransform: 'uppercase'
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                            </button>
                        </div>
                        {/* Body */}
                        <div style={{ padding: '10px 14px', fontFamily: 'Inter, sans-serif' }}>
                            {(realLoc || loc) && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 5 }}>
                                    <span style={{ color: isDark ? '#444' : '#94a3b8', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', minWidth: 34 }}>LOC</span>
                                    <span style={{ color: textSub, fontSize: 11, fontWeight: 600 }}>{realLoc || loc}</span>
                                </div>
                            )}
                            {time && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 5 }}>
                                    <span style={{ color: isDark ? '#444' : '#94a3b8', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', minWidth: 34 }}>DAY</span>
                                    <span style={{ color: textSub, fontSize: 11 }}>Day {day} @ <span style={{ fontFamily: 'JetBrains Mono, monospace', color: isDark ? '#ddd' : '#333' }}>{time}</span></span>
                                </div>
                            )}
                            {duration != null && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginTop: 6, paddingTop: 8, borderTop: `1px solid ${border}` }}>
                                    <span style={{ color: isDark ? '#444' : '#94a3b8', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', minWidth: 34 }}>DUR</span>
                                    <span style={{ color: color, fontSize: 18, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                                        {/* Show canonical duration — 10h for rest, 0.5h for 30-min break. Raw segment duration is unreliable because midnight-splitting cuts it into chunks. */}
                                        {type === 'rest' ? '10.0' : type === 'break' ? '0.5' : Number(duration).toFixed(1)}
                                        <span style={{ fontSize: 11, marginLeft: 2 }}>h</span>
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Tail pointer (rotated square to get border + fill) */}
                        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: bg, borderBottom: `1px solid ${color}44`, borderRight: `1px solid ${color}44`, zIndex: -1 }} />
                    </div>
                ) : (
                    <div
                        className="map-marker-pin"
                        style={{
                            width: 36, height: 46,
                            transition: 'transform 0.25s, filter 0.25s, opacity 0.25s',
                        }}
                    >
                        <PinSvg color={color} type={type} />
                    </div>
                )}
            </div>
        </Marker>
    );
}

export default function RouteMap({ route, logDays, isDark, onUpdateLoc }) {
    const mapRef = useRef(null);
    const [is3D, setIs3D] = useState(false);
    const [activePin, setActivePin] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [snaps, setSnaps] = useState({});

    const handleSnap = (id, coords, name) => {
        // Store flat so snapData.detourPolyline, snapData.lng, snapData.lat are all at top level
        setSnaps(prev => ({ ...prev, [id]: { ...coords, name } }));
    };

    const hasRoute = route && route.waypoints && route.waypoints.length > 0;
    const positions = hasRoute && route.polyline ? route.polyline : [];

    // Calculate cumulative distances to map distancePct to the correct polyline index
    const polyDistances = useMemo(() => {
        if (!positions.length) return [];
        const dists = [0];
        let total = 0;
        const R = 3958.8; // Radius of Earth in miles
        for (let i = 1; i < positions.length; i++) {
            const [lon1, lat1] = positions[i-1];
            const [lon2, lat2] = positions[i];
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            total += R * c;
            dists.push(total);
        }
        return dists;
    }, [positions]);

    // Gather stop markers from logDays
    const stops = useMemo(() => {
        const result = [];
        if (!logDays || !hasRoute) return result;

        logDays.forEach(day => {
            day.segments.forEach(seg => {
                if (['OFF_DUTY', 'SLEEPER_BERTH', 'ON_DUTY_NOT_DRIVING'].includes(seg.status) && seg.duration_hours > 0.1) {
                    const rm = seg.remarks || '';
                    if (!rm.includes('Pre-trip') && !rm.includes('Dropoff') && !rm.includes('Post-trip') && !rm.includes('Pre-shift') && !rm.includes('Pickup') && !rm.includes('Loading') && !rm.includes('cycle restart') && !rm.includes('Evening')) {
                        let type = 'break';
                        if (rm.toLowerCase().includes('10-hr')) type = 'rest';
                        if (rm.toLowerCase().includes('fuel')) type = 'fuel';
                        result.push({ 
                            day: day.day, 
                            time: seg.start_time, 
                            loc: seg.location, 
                            remarks: rm, 
                            duration: seg.duration_hours, 
                            type,
                            distancePct: seg.distance_pct || 0 
                        });
                    }
                }
            });
        });

        // Deduplicate overlapping segments (e.g., midnight crossings)
        const deduped = [];
        result.forEach(s => {
            const last = deduped[deduped.length - 1];
            if (last && last.type === s.type && Math.abs(last.distancePct - s.distancePct) < 0.02) return;
            deduped.push(s);
        });
        result.length = 0;
        deduped.forEach(s => result.push(s));

        if (positions.length >= 2 && result.length > 0 && polyDistances.length === positions.length) {
            const totalDist = polyDistances[polyDistances.length - 1];
            result.forEach((s) => {
                const targetDist = s.distancePct * totalDist;
                let idx = 0;
                while (idx < polyDistances.length - 1 && polyDistances[idx] < targetDist) {
                    idx++;
                }
                s.originalIdx = idx;
                s.lng = positions[idx][0];
                s.lat = positions[idx][1];
            });
        }
        return result;
    }, [logDays, hasRoute, positions, polyDistances]);

    // Detour lines connecting the highway to the snapped amenities
    const detourLinesGeoJSON = useMemo(() => {
        const features = Object.entries(snaps)
            .filter(([id]) => id.startsWith('stop-'))
            .map(([id, snapData]) => {
                const stopIdx = parseInt(id.split('-')[1], 10);
                const stop = stops[stopIdx];
                if (!stop || stop.originalIdx == null || !positions[stop.originalIdx]) return null;
                const hwyCoord = positions[stop.originalIdx];
                let coordsArray = [hwyCoord];
                if (snapData.detourPolyline && snapData.detourPolyline.length > 0) {
                    coordsArray = [...coordsArray, ...snapData.detourPolyline];
                } else {
                    coordsArray.push([snapData.lng, snapData.lat]);
                }
                
                // Filter out any identical adjacent points just to be ultra-safe for Mapbox GL
                coordsArray = coordsArray.filter((pt, i) => {
                    if (i === 0) return true;
                    return pt[0] !== coordsArray[i-1][0] || pt[1] !== coordsArray[i-1][1];
                });

                if (coordsArray.length < 2) {
                    coordsArray.push([coordsArray[0][0] + 0.00001, coordsArray[0][1] + 0.00001]);
                }
                return {
                    type: 'Feature',
                    properties: { type: stop.type },
                    geometry: { type: 'LineString', coordinates: coordsArray }
                };
            }).filter(Boolean);

        return features.length > 0 ? { type: 'FeatureCollection', features } : null;
    }, [snaps, stops, positions]);

    // Use liberty for 3D (has building extrusions). Use bright for colorful 2D per user request.
    const mapStyle = is3D ? STYLES.liberty : STYLES.bright;

    // Fly to route bounds
    useEffect(() => {
        if (!hasRoute || !mapLoaded) return;
        const map = mapRef.current?.getMap();
        if (!map) return;
        
        let minLng = Infinity, minLat = Infinity;
        let maxLng = -Infinity, maxLat = -Infinity;

        // Calculate bounding box
        route.waypoints.forEach(w => {
            if (w.lng < minLng) minLng = w.lng;
            if (w.lat < minLat) minLat = w.lat;
            if (w.lng > maxLng) maxLng = w.lng;
            if (w.lat > maxLat) maxLat = w.lat;
        });

        positions.forEach(p => {
            if (p[0] < minLng) minLng = p[0];
            if (p[1] < minLat) minLat = p[1];
            if (p[0] > maxLng) maxLng = p[0];
            if (p[1] > maxLat) maxLat = p[1];
        });

        if (minLng !== Infinity) {
            map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: { top: 180, bottom: 70, left: 70, right: 70 }, duration: 1400, maxZoom: 12 });
        }
    }, [hasRoute, route, mapLoaded, positions]);

    // Apply pitch on 3D toggle
    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map || !mapLoaded) return;
        map.easeTo({ pitch: is3D ? 45 : 0, bearing: is3D ? -10 : 0, duration: 800 });
    }, [is3D, mapLoaded]);

    const routeGeoJSON = hasRoute && positions.length > 1 ? {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: positions },
    } : null;

    const uiBg = isDark ? 'rgba(13,13,13,0.88)' : 'rgba(255,255,255,0.92)';
    const uiBorder = isDark ? '1px solid #2a2a2a' : '1px solid #e2e8f0';

    const handleZoomToMarker = (lng, lat) => {
        const map = mapRef.current?.getMap();
        if (map) {
            map.flyTo({ center: [lng, lat], zoom: 13, duration: 1200 });
        }
    };

    return (
        <div style={{ height: '100%', minHeight: 480, position: 'relative', borderRadius: 8, overflow: activePin ? 'visible' : 'hidden' }}
             onClick={() => setActivePin(null)}>

            {/* HOS label */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: uiBg, padding: '6px 12px', border: uiBorder, color: '#F59E0B', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, borderRadius: 4, backdropFilter: 'blur(8px)', pointerEvents: 'none', textTransform: 'uppercase' }}>
                ● HOS Route Planner
            </div>

            {/* 2D / 3D toggle */}
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', borderRadius: 6, overflow: 'hidden', border: uiBorder, boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}>
                {['2D', '3D'].map(mode => {
                    const active = mode === '3D' ? is3D : !is3D;
                    return (
                        <button key={mode} onClick={() => setIs3D(mode === '3D')}
                            style={{ padding: '7px 18px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, background: active ? '#F59E0B' : (isDark ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.9)'), color: active ? '#000' : (isDark ? '#555' : '#888'), border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', borderLeft: mode === '3D' ? uiBorder : 'none' }}>
                            {mode}
                        </button>
                    );
                })}
            </div>

            {/* Placeholder */}
            {!hasRoute && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.3)', backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: isDark ? '#111' : '#fff', border: uiBorder, borderRadius: 8, padding: '12px 28px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: isDark ? '#444' : '#888', textTransform: 'uppercase', boxShadow: isDark ? 'none' : '0 8px 32px rgba(0,0,0,0.05)' }}>
                        Enter trip details to generate route
                    </div>
                </div>
            )}

            {/* Dark overlay for 3D dark mode — darkens the liberty style */}
            {is3D && isDark && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.42)', pointerEvents: 'none', mixBlendMode: 'multiply' }} />
            )}

            <Map
                ref={mapRef}
                mapStyle={mapStyle}
                initialViewState={{ longitude: -98.5795, latitude: 39.8283, zoom: 3.5 }}
                style={{ width: '100%', height: '100%' }}
                dragRotate={true}
                touchZoomRotate={true}
                onLoad={() => setMapLoaded(true)}
                attributionControl={false}
            >
                <NavigationControl position="bottom-right" showCompass={true} visualizePitch={true} />

                {/* Route glow + line */}
                {routeGeoJSON && (
                    <>
                        <Source id="route-glow" type="geojson" data={routeGeoJSON}>
                            <Layer id="route-glow-layer" type="line"
                                paint={{ 'line-color': '#F59E0B', 'line-width': 14, 'line-blur': 10, 'line-opacity': 0.25 }}
                                layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
                        </Source>
                        <Source id="route" type="geojson" data={routeGeoJSON}>
                            <Layer id="route-layer" type="line"
                                paint={{ 'line-color': '#F59E0B', 'line-width': 3.5, 'line-opacity': 1 }}
                                layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
                        </Source>
                    </>
                )}

                {/* Detour dashed lines to amenities */}
                {detourLinesGeoJSON && (
                    <Source id="detours" type="geojson" data={detourLinesGeoJSON}>
                        <Layer id="detours-layer" type="line"
                            paint={{
                                'line-color': ['match', ['get', 'type'], 'fuel', '#F59E0B', 'rest', '#8B5CF6', 'meal', '#F97316', 'break', '#64748B', '#888'],
                                'line-width': 2.5,
                                'line-dasharray': [2, 3],
                                'line-opacity': 0.8
                            }}
                            layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
                    </Source>
                )}

                {/* Waypoint markers */}
                {hasRoute && route.waypoints.map((wp, idx) => (
                    <SmartMarker
                        key={`wp-${idx}`}
                        id={`wp-${idx}`}
                        lng={wp.lng} lat={wp.lat}
                        type={wp.type}
                        label={wp.label}
                        activePin={activePin}
                        setActivePin={setActivePin}
                        isDark={isDark}
                        onZoom={handleZoomToMarker}
                    />
                ))}

                {/* Stop markers */}
                {stops.filter(s => s.lat && s.lng).map((s, idx) => (
                    <SmartMarker
                        key={`stop-${idx}`}
                        id={`stop-${idx}`}
                        lng={s.lng} lat={s.lat}
                        type={s.type}
                        label={s.remarks}
                        loc={s.loc}
                        time={s.time}
                        day={s.day}
                        duration={s.duration}
                        activePin={activePin}
                        setActivePin={setActivePin}
                        isDark={isDark}
                        snapIndex={idx}
                        onSnap={handleSnap}
                        onZoom={handleZoomToMarker}
                        onLocUpdate={onUpdateLoc}
                        routePositions={positions}
                    />
                ))}
            </Map>
        </div>
    );
}
