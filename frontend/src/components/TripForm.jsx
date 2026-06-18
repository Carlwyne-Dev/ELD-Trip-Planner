import React, { useState } from 'react';
import { MapPin, Navigation, Clock, User, Building2 } from 'lucide-react';

// CRITICAL: Field must be defined OUTSIDE TripForm to avoid remounting on every keystroke
function Field({ label, name, icon: Icon, placeholder, type = 'text', min, max, step, value, onChange }) {
    return (
        <div className="field-group">
            <div className="field-label">{label}</div>
            <div className="field-wrapper">
                <Icon className="field-icon" />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="field-input"
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                />
            </div>
        </div>
    );
}

export default function TripForm({ onSubmit, isLoading, onError }) {
    const [formData, setFormData] = useState({
        current_location: '',
        pickup_location: '',
        dropoff_location: '',
        current_cycle_used: '',
        driver_name: 'James Carter',
        carrier_name: 'Highway Operator Inc.',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onError) onError('');
        const cycleNum = parseFloat(formData.current_cycle_used) || 0;
        if (cycleNum < 0 || cycleNum > 70) { if (onError) onError('Cycle hours must be between 0 and 70.'); return; }
        if (!formData.current_location || !formData.pickup_location || !formData.dropoff_location) {
            if (onError) onError('All locations are required.'); return;
        }
        onSubmit({ ...formData, current_cycle_used: cycleNum });
    };

    return (
        <div className="form-panel">
            <h3>Route Parameters</h3>

            <form onSubmit={handleSubmit}>
                <Field label="Current Location"     name="current_location"  icon={Navigation} placeholder="Chicago, IL"     value={formData.current_location}  onChange={handleChange} />
                <Field label="Pickup Location"      name="pickup_location"   icon={MapPin}     placeholder="St. Louis, MO"   value={formData.pickup_location}   onChange={handleChange} />
                <Field label="Dropoff Location"     name="dropoff_location"  icon={MapPin}     placeholder="Dallas, TX"      value={formData.dropoff_location}  onChange={handleChange} />
                <Field label="Cycle Hours Used (0-70)" name="current_cycle_used" icon={Clock} placeholder="0.0" type="number" min="0" max="70" step="0.1" value={formData.current_cycle_used} onChange={handleChange} />

                <div style={{ borderTop: '1px solid #1f1f1f', marginTop: 12, paddingTop: 12 }}>
                    <Field label="Driver Name (optional)" name="driver_name"  icon={User}      placeholder="John Doe"        value={formData.driver_name}       onChange={handleChange} />
                    <Field label="Carrier (optional)"     name="carrier_name" icon={Building2} placeholder="USA Truck, Inc." value={formData.carrier_name}      onChange={handleChange} />
                </div>

                <button type="submit" disabled={isLoading} className="plan-btn">
                    {isLoading ? 'CALCULATING...' : 'PLAN MY TRIP'}
                </button>
            </form>
        </div>
    );
}
