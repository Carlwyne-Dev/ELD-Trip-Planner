import React, { useState } from 'react';
import LogCanvas from './LogCanvas';

export default function Logs({ tripData, driverName, carrierName, isDark }) {
    const [selectedDayIdx, setSelectedDayIdx] = useState(0);
    const hasLogs = tripData && tripData.log_days && tripData.log_days.length > 0;
    const logDays = hasLogs ? tripData.log_days : [];
    const activeDay = hasLogs ? logDays[selectedDayIdx] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: '#F59E0B', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Highway Operator <span style={{ color: '#666', fontSize: 14, marginLeft: 8 }}>ARCHIVE / DAILY LOGS</span>
                </h1>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                {/* Left Pane – sticky log list */}
                <div style={{
                    width: 260,
                    flexShrink: 0,
                    position: 'sticky',
                    top: 20,
                    maxHeight: 'calc(100vh - 140px)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #222',
                    paddingRight: 24,
                }}>
                    <div className="text-main" style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>LOG ARCHIVE</div>
                    <div style={{ color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>SELECT DATE RANGE</div>

                    <div className="panel-box-alt" style={{ padding: '10px 12px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="text-muted" style={{ fontSize: 11, fontWeight: 600 }}>CURRENT TRIP</span>
                        <span style={{ color: '#888' }}>📅</span>
                    </div>

                    {/* Scrollable day list */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                        {!hasLogs && <div style={{ color: '#888', fontSize: 12, padding: 16 }}>No logs available. Plan a trip first.</div>}

                        {logDays.map((d, i) => {
                            const isSelected = i === selectedDayIdx;
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDayIdx(i)}
                                    className="panel-box"
                                    style={{
                                        cursor: 'pointer',
                                        border: `1px solid ${isSelected ? '#F59E0B' : '#333'}`,
                                        borderLeft: `4px solid ${isSelected ? '#F59E0B' : '#333'}`,
                                        padding: 16,
                                        borderRadius: 4,
                                    }}
                                >
                                    <div className={isSelected ? 'text-main' : 'text-muted'} style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                                        {d.date} (Day {d.day})
                                    </div>
                                    <div style={{ color: '#666', fontSize: 9, fontWeight: 700 }}>TOTAL MILES</div>
                                    <div className="text-main" style={{ fontSize: 14, fontWeight: 800 }}>{d.total_miles_driven} MI</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 16, padding: '16px 0', borderTop: '1px solid #333' }}>
                        <div style={{ color: '#666', fontSize: 9, fontWeight: 700, marginBottom: 4 }}>SYSTEM STATUS</div>
                        <div style={{ color: '#10B981', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span> CONNECTED
                        </div>
                    </div>
                </div>

                {/* Right Pane – scrolls naturally with page */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 40 }}>
                    {activeDay ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div>
                                    <h2 className="text-main" style={{ fontSize: 28, fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>DAILY LOG SHEET</h2>
                                    <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 700 }}>DAY: {activeDay.day}</div>
                                </div>
                                <button style={{ background: '#F59E0B', border: 'none', color: '#000', padding: '8px 24px', borderRadius: 4, fontWeight: 800, fontSize: 14 }}>
                                    ✏ EDIT LOG
                                </button>
                            </div>

                            {/* Meta cards */}
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                <div className="panel-box" style={{ flex: 1, border: '1px solid #F59E0B', padding: 16 }}>
                                    <div style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>DRIVER</div>
                                    <div className="text-main" style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{driverName || 'N/A'}</div>
                                </div>
                                <div className="panel-box" style={{ flex: 1, padding: 16 }}>
                                    <div style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>VEHICLE ID</div>
                                    <div className="text-main" style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>TRUCK 4022</div>
                                </div>
                                <div className="panel-box" style={{ flex: 1, padding: 16 }}>
                                    <div style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>CARRIER</div>
                                    <div className="text-main" style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{carrierName || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Graph */}
                            <div className="panel-box-alt" style={{ padding: 24, marginBottom: 24 }}>
                                <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>24-HOUR DUTY STATUS GRAPH</div>
                                <div className="canvas-wrapper">
                                    <LogCanvas 
                                        dayData={activeDay} 
                                        isDark={isDark} 
                                        driverName={driverName} 
                                        carrierName={carrierName}
                                        origin={tripData?.trip_summary?.origin}
                                        destination={tripData?.trip_summary?.destination}
                                    />
                                </div>
                            </div>

                            {/* Bottom recap */}
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div className="panel-box" style={{ flex: 1, padding: 24 }}>
                                    <div className="text-main" style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>DUTY RECAP</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }} className="text-muted">
                                        <span>TOTAL MILES TODAY</span>
                                        <span style={{ fontFamily: 'monospace' }}>{activeDay.total_miles_driven} MI</span>
                                    </div>
                                </div>
                                <div className="panel-box" style={{ flex: 1, padding: 24 }}>
                                    <div className="text-main" style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>DRIVER ATTESTATION</div>
                                    <p style={{ color: '#888', fontSize: 11, fontStyle: 'italic', marginBottom: 24 }}>
                                        I hereby certify that my data entries and my record of duty status for this 24-hour period are true and correct.
                                    </p>
                                    <div style={{ color: '#F59E0B', fontSize: 24, fontWeight: 700, fontStyle: 'italic', fontFamily: 'serif' }}>
                                        {driverName || 'DRIVER'}
                                    </div>
                                    <div style={{ borderBottom: '1px dashed #444', marginTop: 4 }}></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                            Select a log day from the archive to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
