import React from 'react';

export default function HOSStatus({ tripData }) {
    const summary = tripData?.trip_summary;
    const hasTrip = !!tripData;
    
    let lastDayDriving = 0;
    let lastDayOnDuty = 0;
    
    if (hasTrip && tripData.log_days && tripData.log_days.length > 0) {
        const lastDay = tripData.log_days[tripData.log_days.length - 1];
        lastDayDriving = lastDay.segments.filter(s => s.status === 'DRIVING').reduce((acc, s) => acc + s.duration_hours, 0);
        lastDayOnDuty = lastDay.segments.filter(s => s.status === 'ON_DUTY_NOT_DRIVING' || s.status === 'DRIVING').reduce((acc, s) => acc + s.duration_hours, 0);
    }
    
    const driveLeft = Math.max(0, 11 - lastDayDriving).toFixed(1);
    const dutyLeft = Math.max(0, 14 - lastDayOnDuty).toFixed(1);
    const cycleLeft = Math.max(0, 70 - (summary?.total_on_duty_hours || 0)).toFixed(1);

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: '#F59E0B', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Highway Operator</h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                    <h2 style={{ color: '#FFF', fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', textTransform: 'uppercase' }}>HOURS OF SERVICE</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {hasTrip ? (
                            <span style={{ background: '#10B981', color: '#000', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 800 }}>ACTIVE PLAN RUNNING</span>
                        ) : (
                            <span style={{ background: '#444', color: '#FFF', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 800 }}>OFF DUTY</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Timers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="panel-box" style={{ border: '1px solid #F59E0B', borderRadius: 8, padding: 16 }}>
                    <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>11-HOUR DRIVE</div>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div className="text-main" style={{ fontSize: 24, fontWeight: 800 }}>{hasTrip ? driveLeft : '11.0'}H</div>
                        <div style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>REMAINING TODAY</div>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2, marginBottom: 4 }}>
                        <div style={{ width: `${hasTrip ? (driveLeft / 11) * 100 : 100}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }}></div>
                    </div>
                </div>
                
                <div className="panel-box" style={{ border: '1px solid #F59E0B', borderRadius: 8, padding: 16 }}>
                    <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>14-HOUR ON-DUTY</div>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div className="text-main" style={{ fontSize: 24, fontWeight: 800 }}>{hasTrip ? dutyLeft : '14.0'}H</div>
                        <div style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>REMAINING TODAY</div>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2, marginBottom: 4 }}>
                        <div style={{ width: `${hasTrip ? (dutyLeft / 14) * 100 : 100}%`, height: '100%', background: '#F59E0B', borderRadius: 2 }}></div>
                    </div>
                </div>
                
                <div className="panel-box" style={{ border: '1px solid #EF4444', borderRadius: 8, padding: 16 }}>
                    <div style={{ color: '#EF4444', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>70-HOUR CYCLE</div>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div className="text-main" style={{ fontSize: 24, fontWeight: 800 }}>{hasTrip ? cycleLeft : '70.0'}H</div>
                        <div style={{ color: '#EF4444', fontSize: 10, fontWeight: 700 }}>REMAINING</div>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2, marginBottom: 4 }}>
                        <div style={{ width: `${hasTrip ? (cycleLeft / 70) * 100 : 100}%`, height: '100%', background: '#EF4444', borderRadius: 2 }}></div>
                    </div>
                </div>
            </div>

            {/* Location Image Area */}
            <div className="panel-box" style={{ borderRadius: 8, height: 240, position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) brightness(0.4)' }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.2) 100%)' }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>SIMULATED POSITION</div>
                        <div style={{ color: '#FFF', fontSize: 24, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                            {hasTrip && tripData.route && tripData.route.length > 0 ? tripData.route[tripData.route.length-1].name : 'UNKNOWN'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
