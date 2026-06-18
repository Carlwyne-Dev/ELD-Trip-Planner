import React from 'react';
import { LayoutDashboard, Route, FileText, Activity, Settings, Truck } from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Route, label: 'Trip Planner', id: 'planner' },
    { icon: FileText, label: 'Logs', id: 'logs' },
    { icon: Activity, label: 'HOS Status', id: 'hos' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function Sidebar({ activeTab, onTabChange }) {
    return (
        <div className="sidebar flex flex-col justify-between" style={{ height: '100vh', padding: '24px 16px', borderRight: '1px solid #222' }}>
            <div>
                <div className="sidebar-logo mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Truck size={18} color="#F59E0B" />
                        <div className="title" style={{ color: '#F59E0B', fontWeight: 800, fontSize: 16 }}>UNIT 4022</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#10B981', fontWeight: 600 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></div>
                        OPERATIONAL
                    </div>
                </div>

                <nav style={{ marginTop: '24px' }} className="flex flex-col gap-2">
                    {navItems.map(({ icon: Icon, label, id }) => {
                        const active = activeTab === id;
                        return (
                            <a key={id} href="#" 
                                className={`nav-item flex items-center gap-3 px-3 py-2 rounded transition-colors ${active ? 'active' : ''}`}
                                onClick={e => { e.preventDefault(); onTabChange(id); }}>
                                <Icon size={16} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                            </a>
                        )
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom mt-auto">
                <div className="driver-profile-card panel-box p-3 rounded" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="https://ui-avatars.com/api/?name=M+A&background=0D8ABC&color=fff" alt="Driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div className="text-main" style={{ fontSize: 12, fontWeight: 700 }}>M. ANDERSON</div>
                        <div className="text-muted" style={{ fontSize: 10, fontWeight: 600 }}>ID: 882-QX</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
