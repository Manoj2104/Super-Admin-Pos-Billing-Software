import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCopy, faBan, faPlus, faCheckCircle, faQrcode, faRotate, faBuilding, faTrash, faHourglassEnd } from '@fortawesome/free-solid-svg-icons';

const SuperAdminKeys = () => {
    const [keys, setKeys] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_keys_cache');
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
    });
    const [loading, setLoading] = useState(() => keys.length === 0);
    const [selectedDuration, setSelectedDuration] = useState('days_365');
    const [newKeyMsg, setNewKeyMsg] = useState(null);
    const [copiedKey, setCopiedKey] = useState('');

    const loadKeys = async (isMounted = true) => {
        try {
            let res;
            try {
                res = await axios.get('api.php?action=keys');
            } catch (e1) {
                res = await axios.get('/api/saas-admin/keys');
            }
            if (isMounted && res && res.data && res.data.success) {
                setKeys(res.data.keys || []);
                try { localStorage.setItem('sa_keys_cache', JSON.stringify(res.data.keys || [])); } catch (e) {}
            }
        } catch (err) {
            console.warn('SuperAdminKeys: load error', err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        loadKeys(isMounted);
        return () => { isMounted = false; };
    }, []);

    const [generating, setGenerating] = useState(false);

    const handleGenerateKey = async () => {
        setGenerating(true);
        try {
            let payload = {};
            if (selectedDuration === 'trial_14') {
                payload = { days: 14, months: 0 };
            } else if (selectedDuration === 'days_30') {
                payload = { days: 30, months: 1 };
            } else if (selectedDuration === 'days_90') {
                payload = { days: 90, months: 3 };
            } else if (selectedDuration === 'days_180') {
                payload = { days: 180, months: 6 };
            } else if (selectedDuration === 'days_365') {
                payload = { days: 365, months: 12 };
            } else if (selectedDuration === 'days_1095') {
                payload = { days: 1095, months: 36 };
            }

            let res;
            try {
                res = await axios.post('api.php?action=generate-key', payload);
            } catch (e1) {
                res = await axios.post('/api/saas-admin/generate-key', payload);
            }

            if (res && res.data && res.data.success) {
                setNewKeyMsg(res.data);
                
                // ⚡ Prepend new key to table in 0ms instantly!
                const newKeyObj = {
                    id: Date.now(),
                    key_code: res.data.key_code,
                    status: 'unused',
                    company_name: 'Unassigned (Standby)',
                    plan_name: res.data.plan_name || 'INFY-POS PREMIUM (30 Days)',
                    expires_at: res.data.expires_at || 'Never',
                    created_at: 'Just Now',
                };
                setKeys(prev => {
                    const updated = [newKeyObj, ...prev];
                    try { localStorage.setItem('sa_keys_cache', JSON.stringify(updated)); } catch (e) {}
                    return updated;
                });
            }
        } catch (err) {
            alert('Failed to generate key: ' + (err.response?.data?.error || err.message));
        } finally {
            setGenerating(false);
        }
    };

    const handleRevokeKey = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this activation key? Connected company will be deactivated.')) return;
        
        // ⚡ 0ms INSTANT OPTIMISTIC UI UPDATE
        const previousKeys = [...keys];
        setKeys(prev => {
            const updated = prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k);
            try { localStorage.setItem('sa_keys_cache', JSON.stringify(updated)); } catch (e) {}
            return updated;
        });

        try {
            let res;
            try {
                res = await axios.post(`api.php?action=revoke-key&id=${id}`);
            } catch (e1) {
                res = await axios.post(`/api/saas-admin/revoke-key/${id}`);
            }
        } catch (err) {
            console.warn('Revoke error', err);
            setKeys(previousKeys);
            alert('Revoke failed: ' + err.message);
        }
    };

    const handleExpireKey = async (id, keyCode) => {
        if (!window.confirm(`Are you sure you want to expire activation key '${keyCode}'? Connected company's plan will expire immediately.`)) return;
        
        // ⚡ 0ms INSTANT OPTIMISTIC UI UPDATE
        const previousKeys = [...keys];
        setKeys(prev => {
            const updated = prev.map(k => (k.id === id || k.key_code === keyCode) ? { ...k, status: 'expired', expires_at: 'Expired Today' } : k);
            try { localStorage.setItem('sa_keys_cache', JSON.stringify(updated)); } catch (e) {}
            return updated;
        });

        try {
            let res;
            try {
                res = await axios.post(`api.php?action=expire-key&id=${id}`);
            } catch (e1) {
                res = await axios.post(`/api/saas-admin/expire-key/${id}`);
            }
        } catch (err) {
            console.warn('Expire error', err);
            setKeys(previousKeys);
            alert('Expire failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteKey = async (id, keyCode) => {
        if (!window.confirm(`Are you sure you want to permanently delete activation key '${keyCode}'?`)) return;
        
        // ⚡ 0ms INSTANT OPTIMISTIC UI UPDATE
        const previousKeys = [...keys];
        setKeys(prev => {
            const updated = prev.filter(k => k.id !== id && k.key_code !== keyCode);
            try { localStorage.setItem('sa_keys_cache', JSON.stringify(updated)); } catch (e) {}
            return updated;
        });

        try {
            let res;
            try {
                res = await axios.post(`api.php?action=delete-key&id=${id}`);
            } catch (e1) {
                res = await axios.delete(`/api/saas-admin/key/${id}`);
            }
        } catch (err) {
            console.warn('Delete error', err);
            setKeys(previousKeys);
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };



    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedKey(code);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        Activation Keys & License Registry
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                        Generate 256-bit secure INFY-POS activation keys, manage license validity, and bind client accounts.
                    </p>
                </div>
                <button
                    onClick={loadKeys}
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#64748B', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    title="Refresh License Keys"
                >
                    <FontAwesomeIcon icon={faRotate} spin={loading} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Global Free Trial Master Key Section */}
            <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
                borderRadius: '12px',
                border: '1px solid #A7F3D0',
                borderLeft: '5px solid #10B981',
                padding: '18px 20px',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#065F46' }}>
                                🌐 Universal Global Free Trial Master Key
                            </span>
                            <span style={{ background: '#10B981', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                Re-Usable Master Key
                            </span>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#047857' }}>
                            Share this global key with any client. Upon activation, a 14-day free trial starts and a unique personal key is auto-created for their billing account.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '14px', color: '#0F172A', letterSpacing: '0.04em' }}>
                            INFYPOS-2026-GLOBAL-FREE-TRIAL-14DAYS
                        </span>
                        <button
                            onClick={() => copyToClipboard('INFYPOS-2026-GLOBAL-FREE-TRIAL-14DAYS')}
                            style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FontAwesomeIcon icon={faCopy} /> {copiedKey === 'INFYPOS-2026-GLOBAL-FREE-TRIAL-14DAYS' ? 'Copied Master Key!' : 'Copy Master Key'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Generator Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faKey} style={{ color: '#10B981' }} /> Instant License Key Generator
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '5px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            SELECT VALIDITY DURATION
                        </label>
                        <select
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(e.target.value)}
                            style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontWeight: '600' }}
                        >
                            <option value="trial_14">⏱ 14 Days Commercial Free Trial (14 Days Free)</option>
                            <option value="days_30">1 Month Standard License (30 Days)</option>
                            <option value="days_90">3 Months Quarterly License (90 Days)</option>
                            <option value="days_180">6 Months Semi-Annual License (180 Days)</option>
                            <option value="days_365">1 Year Full License (365 Days - Recommended)</option>
                            <option value="days_1095">3 Years Enterprise License (1095 Days)</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleGenerateKey}
                            disabled={generating}
                            style={{ background: generating ? '#6EE7B7' : '#10B981', color: '#FFFFFF', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                        >
                            <FontAwesomeIcon icon={generating ? faRotate : faPlus} spin={generating} /> {generating ? 'Generating Key...' : 'Generate Key Code'}
                        </button>
                    </div>
                </div>

                {/* Generated Key Alert Box */}
                {newKeyMsg && (
                    <div style={{ marginTop: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', textTransform: 'uppercase' }}>New Activation Key Created:</div>
                            <div style={{ fontSize: '17px', fontFamily: 'monospace', fontWeight: '900', color: '#065F46', marginTop: '3px' }}>
                                {newKeyMsg.key_code}
                            </div>
                            <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px', fontWeight: '700' }}>
                                Valid until: {newKeyMsg.expires_at} ({newKeyMsg.plan_name || newKeyMsg.duration_label || 'Standard License'})
                            </div>
                        </div>

                        <button
                            onClick={() => copyToClipboard(newKeyMsg.key_code)}
                            style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                        >
                            <FontAwesomeIcon icon={faCopy} /> {copiedKey === newKeyMsg.key_code ? 'Copied!' : 'Copy Key'}
                        </button>
                    </div>
                )}
            </div>

            {/* Keys Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>License Keys Master Log</h3>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textWrap: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '11px' }}>
                                <th style={{ padding: '12px 16px' }}>ACTIVATION KEY CODE</th>
                                <th style={{ padding: '12px 16px' }}>STATUS</th>
                                <th style={{ padding: '12px 16px' }}>PLAN & DURATION</th>
                                <th style={{ padding: '12px 16px' }}>ASSIGNED COMPANY</th>
                                <th style={{ padding: '12px 16px' }}>EXPIRATION DATE</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys && keys.length > 0 ? (
                                keys.map((k) => (
                                    <tr key={k.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', background: '#F1F5F9', padding: '3px 8px', borderRadius: '5px', color: '#0F172A' }}>
                                                {k.key_code}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {k.status === 'unused' && <span className="sa-pill sa-pill-trial">● Unused</span>}
                                            {(k.status === 'active' || k.status === 'trial') && <span className="sa-pill sa-pill-active">● Active</span>}
                                            {k.status === 'expired' && <span className="sa-pill sa-pill-expired">🔒 Expired</span>}
                                            {k.status === 'revoked' && <span className="sa-pill sa-pill-suspended">🚫 Revoked</span>}
                                        </td>

                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#059669' }}>
                                            {k.plan_name || 'INFY-POS FREE TRIAL (14 Days)'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#334155' }}>
                                            {k.company_name || 'Not Bound Yet'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{k.expires_at}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <button
                                                    onClick={() => copyToClipboard(k.key_code)}
                                                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '4px 9px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                                                    title="Copy Key Code"
                                                >
                                                    <FontAwesomeIcon icon={faCopy} /> {copiedKey === k.key_code ? 'Copied' : 'Copy'}
                                                </button>
                                                {k.status !== 'revoked' && (
                                                    <button
                                                        onClick={() => handleRevokeKey(k.id)}
                                                        style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#D97706', padding: '4px 9px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                                                        title="Revoke Key"
                                                    >
                                                        <FontAwesomeIcon icon={faBan} /> Revoke
                                                    </button>
                                                )}
                                                {k.status !== 'expired' && k.status !== 'revoked' && k.key_code !== 'INFYPOS-2026-GLOBAL-FREE-TRIAL-14DAYS' && (
                                                    <button
                                                        onClick={() => handleExpireKey(k.id, k.key_code)}
                                                        style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', color: '#C2410C', padding: '4px 9px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                                                        title="Force Expire Plan Immediately"
                                                    >
                                                        <FontAwesomeIcon icon={faHourglassEnd} /> Expire
                                                    </button>
                                                )}
                                                {k.key_code !== 'INFYPOS-2026-GLOBAL-FREE-TRIAL-14DAYS' && (
                                                    <button
                                                        onClick={() => handleDeleteKey(k.id, k.key_code)}
                                                        style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '4px 9px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                                                        title="Delete Key Permanently"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                                        No activation keys generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminKeys;
