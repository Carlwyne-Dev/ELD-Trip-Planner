import React, { useRef, useState } from 'react';
import LogCanvas from './LogCanvas';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS = {
    DRIVING: 'DRIVING',
    OFF_DUTY: 'OFF DUTY',
    ON_DUTY_NOT_DRIVING: 'ON DUTY',
    SLEEPER_BERTH: 'SLEEPER',
};

function fmt12(t) {
    if (!t) return '';
    const [hh, mm] = t.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h = hh % 12 || 12;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export default function LogSheet({ logDays, driverName, carrierName, isDark }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const canvasRef = useRef(null);

    if (!logDays || logDays.length === 0) return null;

    const total = logDays.length;
    const dayData = logDays[currentIdx];

    const prev = () => setCurrentIdx(i => Math.max(0, i - 1));
    const next = () => setCurrentIdx(i => Math.min(total - 1, i + 1));

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `ELD_Log_Day${dayData.day}_${dayData.date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div style={{ marginTop: 24 }}>
            {/* ── Carousel Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
            }}>
                {/* Left arrow */}
                <button
                    onClick={prev}
                    disabled={currentIdx === 0}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 40, height: 40, borderRadius: '50%',
                        border: '1px solid #333', background: currentIdx === 0 ? 'transparent' : '#1a1a1a',
                        color: currentIdx === 0 ? '#333' : '#F59E0B',
                        cursor: currentIdx === 0 ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Day indicator */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ color: '#F59E0B', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 2 }}>
                        DAY {dayData.day} OF {total} &nbsp;·&nbsp; {dayData.date}
                    </div>
                    {/* Dot nav */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {logDays.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIdx(i)}
                                style={{
                                    width: i === currentIdx ? 20 : 8,
                                    height: 8, borderRadius: 4,
                                    background: i === currentIdx ? '#F59E0B' : '#333',
                                    border: 'none', cursor: 'pointer',
                                    transition: 'all 0.25s',
                                    padding: 0,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right arrow */}
                <button
                    onClick={next}
                    disabled={currentIdx === total - 1}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 40, height: 40, borderRadius: '50%',
                        border: '1px solid #333', background: currentIdx === total - 1 ? 'transparent' : '#1a1a1a',
                        color: currentIdx === total - 1 ? '#333' : '#F59E0B',
                        cursor: currentIdx === total - 1 ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* ── Day Card ── */}
            <div className="log-sheet">
                <div className="log-header">
                    <div className="log-title">
                        <h3>DRIVER'S DAILY LOG</h3>
                        <span className="log-date">Date: {dayData.date} &nbsp;|&nbsp; Day {dayData.day}</span>
                    </div>
                    <button className="export-btn" onClick={handleExport}>
                        <Download size={13} /> EXPORT PNG
                    </button>
                </div>

                <div className="log-meta">
                    <div className="meta-item"><span>Driver</span>{driverName || '—'}</div>
                    <div className="meta-item"><span>Carrier</span>{carrierName || '—'}</div>
                    <div className="meta-item"><span>Total Miles</span>{dayData.total_miles_driven} mi</div>
                    <div className="meta-item"><span>Segments</span>{dayData.segments.length} entries</div>
                </div>

                <div className="canvas-wrapper">
                    <LogCanvas
                        dayData={dayData}
                        driverName={driverName}
                        carrierName={carrierName}
                        canvasRef={canvasRef}
                        isDark={isDark}
                    />
                </div>

                <div className="log-table-container">
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>TIME</th>
                                <th>ACTIVITY</th>
                                <th>LOCATION</th>
                                <th>REMARKS</th>
                                <th>DURATION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayData.segments.map((seg, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#aaa' }}>
                                        {fmt12(seg.start_time)} – {fmt12(seg.end_time)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${seg.status.toLowerCase()}`}>
                                            {STATUS_LABELS[seg.status]}
                                        </span>
                                    </td>
                                    <td>{seg.location}</td>
                                    <td style={{ color: '#555' }}>{seg.remarks}</td>
                                    <td className="duration">{seg.duration_hours.toFixed(2)}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
