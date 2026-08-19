import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faCheck, faKey, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const SuperAdminSettings = () => {
    const [settings, setSettings] = useState({
        platform_name: 'INFY-POS Enterprise SaaS',
        trial_days: 14,
        grace_period_days: 3,
        monthly_price: 499,
        currency_symbol: '₹',
        razorpay_key: 'rzp_live_INFYPOS2026SECRET',
        gst_percentage: 18,
        support_email: 'support@infy-pos.com',
        support_phone: '+91 8610006544',
    });
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        let isMounted = true;
        const loadSettings = async () => {
            try {
                const res = await axios.get('/api/saas-admin/settings');
                if (isMounted && res.data && res.data.success && res.data.settings) {
                    setSettings(res.data.settings);
                }
            } catch (err) {
                console.warn('SuperAdminSettings: load error', err);
            }
        };
        loadSettings();
        return () => { isMounted = false; };
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/saas-admin/settings/update', settings);
            if (res.data && res.data.success) {
                setSaveMsg(res.data.message);
                setTimeout(() => setSaveMsg(''), 4000);
            }
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Global Platform Configuration</h1>
                    <p className="sa-page-subtitle">Configure default free trial days, grace period, subscription pricing, Razorpay credentials, and support details.</p>
                </div>
            </div>

            {saveMsg && (
                <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: '700' }}>
                    ✓ {saveMsg}
                </div>
            )}

            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    {/* Trial & Subscription Rules Card (Clean Light Theme) */}
                    <div className="sa-card">
                        <div className="sa-card-header">
                            <h3 className="sa-card-title">⏱️ Trial & Billing Rules</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    DEFAULT FREE TRIAL DURATION (DAYS)
                                </label>
                                <input
                                    type="number"
                                    className="sa-form-control"
                                    value={settings.trial_days}
                                    onChange={(e) => setSettings({ ...settings, trial_days: parseInt(e.target.value, 10) })}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    GRACE PERIOD DURATION (DAYS)
                                </label>
                                <input
                                    type="number"
                                    className="sa-form-control"
                                    value={settings.grace_period_days}
                                    onChange={(e) => setSettings({ ...settings, grace_period_days: parseInt(e.target.value, 10) })}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    MONTHLY SUBSCRIPTION PRICE (INR ₹)
                                </label>
                                <input
                                    type="number"
                                    className="sa-form-control"
                                    value={settings.monthly_price}
                                    onChange={(e) => setSettings({ ...settings, monthly_price: parseInt(e.target.value, 10) })}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    GST TAX PERCENTAGE (%)
                                </label>
                                <input
                                    type="number"
                                    className="sa-form-control"
                                    value={settings.gst_percentage}
                                    onChange={(e) => setSettings({ ...settings, gst_percentage: parseInt(e.target.value, 10) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Gateway & Support Card (Clean Light Theme) */}
                    <div className="sa-card">
                        <div className="sa-card-header">
                            <h3 className="sa-card-title">💳 Payment Gateway & Contact Info</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    RAZORPAY LIVE KEY ID / SECRET
                                </label>
                                <input
                                    type="text"
                                    className="sa-form-control"
                                    value={settings.razorpay_key}
                                    onChange={(e) => setSettings({ ...settings, razorpay_key: e.target.value })}
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    SUPPORT EMAIL ADDRESS
                                </label>
                                <input
                                    type="email"
                                    className="sa-form-control"
                                    value={settings.support_email}
                                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'block' }}>
                                    SUPPORT HELPLINE PHONE
                                </label>
                                <input
                                    type="text"
                                    className="sa-form-control"
                                    value={settings.support_phone}
                                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                                />
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <button type="submit" className="sa-btn-emerald" style={{ width: '100%', justifyContent: 'center', height: '44px' }}>
                                    <FontAwesomeIcon icon={faSave} /> Save Platform Settings
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default SuperAdminSettings;
