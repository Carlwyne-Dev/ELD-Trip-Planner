import React from 'react';
import { LayoutDashboard, Route, FileText, Activity, Settings, Truck, LogOut } from 'lucide-react';

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
                <button 
                    className="flex items-center gap-3 px-3 py-2 rounded w-full text-left transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    style={{ color: '#ef4444', fontWeight: 600, fontSize: 13, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
