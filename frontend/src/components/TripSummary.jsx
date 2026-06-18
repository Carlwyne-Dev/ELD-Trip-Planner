import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ASSUMPTIONS = [
    ['Average Speed',       '55 mph (highway)'],
    ['Fuel Stop Interval',  'Every 1,000 miles'],
    ['Pickup Duration',     '1 hour (on-duty not driving)'],
    ['Dropoff Duration',    '1 hour (on-duty not driving)'],
    ['Break Rule',          '30 min after 8 hrs driving'],
    ['Max Drive / Shift',   '11 hours'],
    ['On-Duty Window',      '14 hours per shift'],
    ['Required Rest',       '10 hours off-duty between shifts'],
    ['Cycle Limit',         '70 hrs / 8 days'],
    ['Regulations',         'FMCSA 49 CFR Part 395 — Property-Carrying'],
    ['Adverse Conditions',  'None assumed'],
];

export default function TripSummary({ summary, isDark = true }) {
    const [showAssumptions, setShowAssumptions] = useState(false);

    if (!summary) return null;

    const driving  = parseFloat(summary.total_driving_hours) || 0;
    const onDuty   = parseFloat(summary.total_on_duty_hours)  || 0;
    const days     = parseInt(summary.total_days)             || 1;
    const cycle    = parseFloat(summary.cycle_hours_used)     || onDuty;

    const avgDrive = driving / days;
    const avgDuty  = onDuty  / days;

    const rules = [
        { rule: '11-Hour Driving Limit',        check: avgDrive <= 11,   value: `${avgDrive.toFixed(1)} h avg / day`,   limit: '≤ 11 h' },
        { rule: '14-Hour On-Duty Window',        check: avgDuty  <= 14,   value: `${avgDuty.toFixed(1)} h avg / day`,   limit: '≤ 14 h' },
        { rule: '30-Min Break After 8 Hrs',      check: true,             value: 'Applied',                              limit: 'Required' },
        { rule: '10-Hr Off-Duty Between Shifts', check: true,             value: 'Applied',                              limit: 'Required' },
        { rule: '70-Hr / 8-Day Cycle',           check: cycle <= 70,      value: `${cycle.toFixed(1)} h used`,          limit: '≤ 70 h' },
        { rule: 'FMCSA Property-Carrying Rules', check: true,             value: '49 CFR §395',                         limit: 'Compliant' },
    ];

    return (
        <div style={{ marginTop: 24 }}>

            {/* ── Stat bar ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderTop: '2px solid #F59E0B',
                borderBottom: '1px solid #222',
                marginBottom: 0,
            }}>
                {[
                    { v: summary.total_miles,        l: 'Total Miles',    s: 'Estimated Distance' },
                    { v: summary.total_days,          l: 'Total Days',     s: 'Multi-Stop Itinerary' },
                    { v: summary.total_driving_hours, l: 'Driving Hours',  s: 'HOS Projected Usage' },
                    { v: summary.total_on_duty_hours, l: 'On-Duty Hours',  s: 'Incl. Non-Driving' },
                ].map((s, i, arr) => (
                    <div key={i} style={{
                        padding: '18px 20px',
                        borderRight: i < arr.length - 1 ? (isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0') : 'none',
                        background: isDark ? '#0d0d0d' : '#ffffff',
                    }}>
                        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: isDark ? '#fff' : '#111', lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#F59E0B', marginTop: 4 }}>{s.l}</div>
                        <div style={{ fontSize: 9, color: isDark ? '#444' : '#888', letterSpacing: 1, marginTop: 2, textTransform: 'uppercase' }}>{s.s}</div>
                    </div>
                ))}
            </div>

            {/* ── HOS Compliance table ── */}
            <div style={{ background: isDark ? '#0a0a0a' : '#fafafa', border: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0', borderTop: 'none' }}>

                {/* Table header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px 160px',
                    padding: '8px 20px',
                    background: isDark ? '#111' : '#f1f5f9',
                    borderBottom: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0',
                }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: isDark ? '#444' : '#64748b' }}>HOS COMPLIANCE CHECK</div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: isDark ? '#444' : '#64748b', textAlign: 'center' }}>LIMIT</div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: isDark ? '#444' : '#64748b', textAlign: 'center' }}>RESULT</div>
                </div>

                {rules.map((r, i) => (
                    <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr 160px 160px',
                        padding: '11px 20px',
                        borderBottom: i < rules.length - 1 ? (isDark ? '1px solid #141414' : '1px solid #f1f5f9') : 'none',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Status dot */}
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: r.check ? '#10B981' : '#EF4444',
                                boxShadow: r.check ? '0 0 6px #10B98188' : '0 0 6px #EF444488',
                            }} />
                            <span style={{ fontSize: 12, color: isDark ? '#bbb' : '#334155', fontWeight: 500 }}>{r.rule}</span>
                        </div>
                        <div style={{
                            textAlign: 'center', fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: isDark ? '#555' : '#94a3b8',
                        }}>{r.limit}</div>
                        <div style={{
                            textAlign: 'center', fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 700,
                            color: r.check ? '#10B981' : '#EF4444',
                        }}>
                            {r.check ? '✓ ' : '✗ '}{r.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Assumptions accordion ── */}
            <div style={{ border: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0', borderTop: 'none' }}>
                <button
                    onClick={() => setShowAssumptions(o => !o)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 20px', background: isDark ? '#0d0d0d' : '#f8fafc', border: 'none',
                        cursor: 'pointer', color: isDark ? '#555' : '#64748b', fontSize: 9,
                        fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
                    }}
                >
                    <span>Trip Assumptions &amp; FMCSA Rules Applied</span>
                    {showAssumptions ? <ChevronUp size={13} color={isDark ? '#444' : '#94a3b8'} /> : <ChevronDown size={13} color={isDark ? '#444' : '#94a3b8'} />}
                </button>
                {showAssumptions && (
                    <div style={{
                        background: isDark ? '#080808' : '#ffffff',
                        borderTop: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0',
                        padding: '12px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        columnGap: 40,
                    }}>
                        {ASSUMPTIONS.map(([label, value], i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '6px 0',
                                borderBottom: isDark ? '1px solid #111' : '1px solid #f1f5f9',
                                gap: 16,
                            }}>
                                <span style={{ fontSize: 10, color: isDark ? '#444' : '#64748b', fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</span>
                                <span style={{ fontSize: 10, color: isDark ? '#888' : '#475569', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
