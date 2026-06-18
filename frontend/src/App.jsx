import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import TripSummary from './components/TripSummary';
import LogSheet from './components/LogSheet';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import HOSStatus from './components/HOSStatus';
import Settings from './components/Settings';
import { planTrip } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState('');
  const [formMeta, setFormMeta] = useState({ driverName: '', carrierName: '' });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handlePlanTrip = async (data) => {
    setIsLoading(true);
    setError('');
    setFormMeta({ driverName: data.driver_name || '', carrierName: data.carrier_name || '' });
    try {
      const result = await planTrip(data);
      setTripData(result);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-clear error toast after 2.5 seconds
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 2500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleUpdateLoc = (day, time, newLoc) => {
    setTripData(prev => {
      if (!prev) return prev;
      const newDays = prev.log_days.map(d => {
        if (d.day !== day) return d;
        return {
          ...d,
          segments: d.segments.map(s => s.start_time === time ? { ...s, location: newLoc } : s)
        };
      });
      return { ...prev, log_days: newDays };
    });
  };

  return (
    <>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-layout">
        <TopHeader isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="content-area">

          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} tripData={tripData} />}
          {activeTab === 'logs' && <Logs tripData={tripData} driverName={formMeta.driverName} carrierName={formMeta.carrierName} isDark={isDark} />}
          {activeTab === 'hos' && <HOSStatus tripData={tripData} />}
          {activeTab === 'settings' && <Settings formMeta={formMeta} />}

          {activeTab === 'planner' && (
            <>
              {/* Hero */}
              <div className="hero-text" style={{ marginBottom: 16 }}>
                <div className="plan-title">PLAN YOUR ROUTE.<br/>STAY COMPLIANT.</div>
                <div className="plan-sub">Fleet-certified intelligence · Real-time HOS synchronization</div>
              </div>

              {/* Two-pane: form + map */}
              <div className="two-pane">
                <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} onError={setError} />
                <RouteMap route={tripData?.route} logDays={tripData?.log_days} isDark={isDark} onUpdateLoc={handleUpdateLoc} />
              </div>

              {/* Toast Error Notification */}
              {error && (
                <div style={{
                  position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
                  background: '#DC2626', color: 'white', padding: '14px 20px',
                  borderRadius: 8, boxShadow: '0 8px 30px rgba(220, 38, 38, 0.4)',
                  fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12,
                  animation: 'toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}

              {/* Results */}
              {tripData && (
                <div id="results-section">
                  <TripSummary summary={tripData.trip_summary} isDark={isDark} />
                  <LogSheet
                    logDays={tripData.log_days}
                    driverName={formMeta.driverName}
                    carrierName={formMeta.carrierName}
                    isDark={isDark}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;

