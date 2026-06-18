import React from 'react';

export default function Settings({ formMeta }) {
    const driverName = formMeta?.driverName || 'James Carter';
    const carrierName = formMeta?.carrierName || 'Highway Heavy Logistics';
    
    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: '#F59E0B', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Highway Operator <span style={{ color: '#666', fontSize: 14, marginLeft: 8 }}>SETTINGS / SYSTEM CONTROL</span></h1>
            </div>

            <h2 style={{ color: '#FFF', fontSize: 24, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px 0' }}>OPERATIONAL CONFIGURATIONS</h2>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 32, maxWidth: 600 }}>Modify critical driver, vehicle, and compliance parameters. Changes to Rule Sets may impact HOS eligibility and must be verified against current FMCSA regulations.</p>

            <div style={{ display: 'flex', gap: 24 }}>
                {/* Left Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, flexWrap: 'wrap' }}>
                    
                    {/* Driver Profile */}
                    <div className="panel-box" style={{ borderRadius: 8, padding: 24, width: '100%' }}>
                        <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>DRIVER PROFILE</div>
                        <div style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>IDENTITY & CREDENTIALS</div>
                        
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>FULL NAME</label>
                                <input type="text" value={driverName} readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>CDL NUMBER</label>
                                <input type="text" value="8824-TX-9901" readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>EMAIL ADDRESS</label>
                            <input type="text" value="j.carter@highway-heavy.logistics" readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="panel-box" style={{ borderRadius: 8, padding: 24, width: '100%' }}>
                        <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>VEHICLE INFORMATION</div>
                        <div style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>MACHINE REGISTRY</div>
                        
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>UNIT ID</label>
                                <input type="text" value="UNIT-4022" readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>VIN</label>
                                <input type="text" value="1XP5DB9X0F123456" readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>ODOMETER (MI)</label>
                                <input type="text" value="248,391.4" readOnly className="field-input" style={{ width: '100%', color: '#F59E0B', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: '#888', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>PLATE NUMBER</label>
                                <input type="text" value="TX-HWAY-77" readOnly className="field-input" style={{ width: '100%', padding: '10px 12px', borderRadius: 4, fontFamily: 'Inter' }} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div style={{ width: 340 }}>
                    <div className="panel-box" style={{ borderRadius: 8, padding: 24, height: '100%' }}>
                        <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 24 }}>COMPLIANCE RULES</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <span style={{ color: '#FFF', fontSize: 11, fontWeight: 700 }}>RULE SELECTION</span>
                            <div className="panel-box-alt" style={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
                                <button style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>STANDARD</button>
                                <button style={{ background: 'transparent', color: '#888', border: 'none', padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>SHORT-HAUL</button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                    <div style={{ width: 6, height: 6, background: '#111', borderRadius: '50%' }}></div>
                                </div>
                                <div>
                                    <div style={{ color: '#FFF', fontSize: 11, fontWeight: 700 }}>11-HOUR DRIVING LIMIT</div>
                                    <div style={{ color: '#666', fontSize: 9 }}>Maximum time allowed behind the wheel after 10 consecutive hours off duty.</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                    <div style={{ width: 6, height: 6, background: '#111', borderRadius: '50%' }}></div>
                                </div>
                                <div>
                                    <div style={{ color: '#FFF', fontSize: 11, fontWeight: 700 }}>14-HOUR ON-DUTY WINDOW</div>
                                    <div style={{ color: '#666', fontSize: 9 }}>Daily window for all work activities. Cannot drive past the 14th hour.</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #333', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#CCC', fontSize: 11, fontWeight: 700 }}>ADVERSE DRIVING CONDITIONS</span>
                                <div style={{ width: 32, height: 16, background: '#333', borderRadius: 8, position: 'relative' }}>
                                    <div style={{ width: 12, height: 12, background: '#888', borderRadius: '50%', position: 'absolute', left: 2, top: 2 }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#CCC', fontSize: 11, fontWeight: 700 }}>PERSONAL CONVEYANCE (OFF-DUTY)</span>
                                <div style={{ width: 32, height: 16, background: '#F59E0B', borderRadius: 8, position: 'relative' }}>
                                    <div style={{ width: 12, height: 12, background: '#000', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#CCC', fontSize: 11, fontWeight: 700 }}>YARD MOVE (ON-DUTY)</span>
                                <div style={{ width: 32, height: 16, background: '#F59E0B', borderRadius: 8, position: 'relative' }}>
                                    <div style={{ width: 12, height: 12, background: '#000', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                                </div>
                            </div>
                        </div>

                        <button style={{ width: '100%', padding: '12px 0', background: '#F59E0B', color: '#000', fontWeight: 800, borderRadius: 4, border: 'none', marginTop: 40, cursor: 'pointer' }}>COMMIT CHANGES TO ELD</button>
                        <div style={{ textAlign: 'center', color: '#666', fontSize: 8, marginTop: 8, letterSpacing: 1 }}>DATA WILL BE SYNCED TO FLEET COMMAND INSTANTLY</div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, borderTop: '1px solid #222', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#10B981', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span> ELD DEVICE: ONLINE</span>
                    <span style={{ color: '#888', fontSize: 10, fontWeight: 700 }}>NETWORK: HIGH STRENGTH</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{ background: 'transparent', border: '1px solid #444', color: '#FFF', fontSize: 10, padding: '6px 12px', borderRadius: 4 }}>EXPORT LOGS</button>
                    <button style={{ background: 'transparent', border: '1px solid #444', color: '#FFF', fontSize: 10, padding: '6px 12px', borderRadius: 4 }}>SYSTEM DIAGNOSTIC</button>
                </div>
            </div>

        </div>
    );
}
