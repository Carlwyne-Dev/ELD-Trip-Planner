import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';

export default function TopHeader({ isDark, onToggleDark }) {
    return (
        <div className="top-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="logo-text">HIGHWAY OPERATOR</span>
                <span className="sub-text">ELD TRIP PLANNER</span>
            </div>
            <div className="header-right">
                {isDark ? (
                    <Sun size={16} color="#aaa" style={{ cursor: 'pointer' }} onClick={onToggleDark} />
                ) : (
                    <Moon size={16} color="#555" style={{ cursor: 'pointer' }} onClick={onToggleDark} />
                )}
                <Bell size={16} color={isDark ? '#aaa' : '#555'} style={{ cursor: 'pointer' }} />
            </div>
        </div>
    );
}
