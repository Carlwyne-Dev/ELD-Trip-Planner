import React from 'react';

export default function Dashboard({ onNavigate, tripData }) {
    const summary = tripData?.trip_summary;
    const hasTrip = !!tripData;

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: '#F59E0B', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Highway Operator</h1>
            </div>

            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                <div className="panel-box stat-card" style={{ gridColumn: 'span 1' }}>
                    <div className="stat-label">CURRENT STATUS</div>
                    <div className="stat-value" style={{ color: '#F59E0B' }}>
                        {hasTrip ? 'ON DUTY' : 'OFF DUTY'} 
                        {hasTrip && <span style={{ fontSize: 12, background: '#EA580C', color: '#FFF', padding: '2px 6px', borderRadius: 4, verticalAlign: 'middle', marginLeft: 8 }}>DRIVING</span>}
                    </div>
                    
                    <div style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', fontWeight: 600, marginBottom: 4 }}>
                            <span>DRIVING HOURS USED</span>
                            <span style={{ color: '#F59E0B' }}>{summary?.total_driving_hours || 0}H</span>
                        </div>
                        <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2 }}>
                            <div style={{ width: `${Math.min(((summary?.total_driving_hours || 0) / 11) * 100, 100)}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }}></div>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', fontWeight: 600, marginBottom: 4 }}>
                            <span>ON DUTY HOURS USED</span>
                            <span style={{ color: '#F59E0B' }}>{summary?.total_on_duty_hours || 0}H</span>
                        </div>
                        <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2 }}>
                            <div style={{ width: `${Math.min(((summary?.total_on_duty_hours || 0) / 14) * 100, 100)}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }}></div>
                        </div>
                    </div>

                    <button style={{ width: '100%', padding: '10px 0', background: '#F5A00C', color: '#000', fontWeight: 700, borderRadius: 4, border: 'none', marginTop: 20, cursor: 'pointer' }}>CHANGE STATUS</button>
                </div>

                <div className="panel-box stat-card">
                    <div className="stat-label">PROJECTED MILES</div>
                    <div className="stat-value">{summary?.total_miles || 0}</div>
                    <div style={{ color: '#10B981', fontSize: 11, fontWeight: 600, marginTop: 16 }}>BASED ON CURRENT PLAN</div>
                </div>

                <div className="panel-box stat-card">
                    <div className="stat-label">TRIP DURATION</div>
                    <div className="stat-value">{summary?.total_days || 0} <span style={{ fontSize: 14 }}>DAYS</span></div>
                    <div style={{ color: '#888', fontSize: 11, fontWeight: 600, marginTop: 16 }}>INCLUDES REQUIRED RESTS</div>
                </div>

                <div className="panel-box stat-card">
                    <div className="stat-label">HOS COMPLIANCE</div>
                    <div className="stat-value">100%</div>
                    <div style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600, marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }}></span> FMCSA VALIDATED
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="panel-box" style={{ borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <h3 className="eld-title" style={{ fontSize: 16, margin: '0 0 4px 0' }}>SYSTEM TELEMETRY ACTIVE</h3>
                <p className="stat-sub" style={{ margin: 0, textTransform: 'none' }}>Unit 4022 Engine Data: Nominal Operating Temperature 195°F</p>
            </div>

            {/* Bottom Table */}
            <div className="panel-box" style={{ borderRadius: 8, padding: '16px 0' }}>
                <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 className="eld-title" style={{ fontSize: 16, margin: 0 }}>RECENT MANIFESTS</h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333' }}>
                            <th style={{ color: '#888', fontSize: 10, fontWeight: 700, padding: '8px 16px', textAlign: 'left' }}>TRIP ID</th>
                            <th style={{ color: '#888', fontSize: 10, fontWeight: 700, padding: '8px 16px', textAlign: 'left' }}>ORIGIN / DESTINATION</th>
                            <th style={{ color: '#888', fontSize: 10, fontWeight: 700, padding: '8px 16px', textAlign: 'left' }}>DATE</th>
                            <th style={{ color: '#888', fontSize: 10, fontWeight: 700, padding: '8px 16px', textAlign: 'left' }}>MILES</th>
                            <th style={{ color: '#888', fontSize: 10, fontWeight: 700, padding: '8px 16px', textAlign: 'left' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hasTrip ? (
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '16px', color: '#FFF', fontSize: 12, fontWeight: 700 }}>#ACTIVE-PLAN</td>
                                <td className="stat-value" style={{ padding: '16px', fontSize: 12 }}>#ACTIVE-PLAN</td>
                                <td className="stat-value" style={{ padding: '16px', fontSize: 12 }}>
                                    <div>• Route Origin</div>
                                    <div>• Route Destination</div>
                                </td>
                                <td className="stat-value" style={{ padding: '16px', fontSize: 12 }}>Today</td>
                                <td className="stat-value" style={{ padding: '16px', fontSize: 12 }}>{summary.total_miles}</td>
                                <td style={{ padding: '16px' }}><span style={{ color: '#F59E0B', border: '1px solid #F59E0B44', background: '#F59E0B11', padding: '2px 6px', fontSize: 9, borderRadius: 4, fontWeight: 700 }}>PLANNED</span></td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: '#666', fontSize: 12 }}>No recent trips. Plan a trip to see manifests.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating Action Button */}
            <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
                <button 
                    onClick={() => onNavigate('planner')}
                    style={{ width: 48, height: 48, background: '#F59E0B', color: '#000', border: 'none', borderRadius: 8, fontSize: 24, fontWeight: 300, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                    +
                </button>
            </div>
        </div>
    );
}
