import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPlus, faCheckCircle, faSearch, faRotate, faUserCheck, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';

const SuperAdminTrials = () => {
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [extendModal, setExtendModal] = useState(false);
    const [extraDays, setExtraDays] = useState(7);
    const [extending, setExtending] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const loadTrials = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/saas-admin/trial-management');
            if (res.data && res.data.success) {
                setTrials(res.data.trials || []);
            }
        } catch (err) {
            console.warn('SuperAdminTrials error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrials();
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const handleExtendSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setExtending(true);
        try {
            const res = await axios.post('/api/saas-admin/extend-trial', {
                company_id: selectedCompany.id,
                days: extraDays
            });
            if (res.data && res.data.success) {
                showToast(res.data.message);
                setExtendModal(false);
                setSelectedCompany(null);
                loadTrials();
            } else {
                alert('Extension failed: ' + (res.data.error || res.data.message));
            }
        } catch (err) {
            alert('Extension error: ' + (err.response?.data?.error || err.message));
        } finally {
            setExtending(false);
        }
    };

    const filtered = trials.filter(t => {
        const q = searchQuery.toLowerCase();
        return (t.company_name && t.company_name.toLowerCase().includes(q)) ||
               (t.owner_name && t.owner_name.toLowerCase().includes(q)) ||
               (t.email && t.email.toLowerCase().includes(q));
    });

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <FontAwesomeIcon icon={faRotate} spin style={{ fontSize: '24px', color: '#10B981' }} />
                <div style={{ marginTop: '12px', fontWeight: '600' }}>Loading Trial Management Control Center...</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
            {toastMsg && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, background: '#0F172A', color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10B981' }} />
                    {toastMsg}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Trial Accounts & Extension Manager</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Monitor free trial accounts, expiration countdowns, and grant trial extensions in real-time.</p>
                </div>
                <button onClick={loadTrials} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faRotate} /> Refresh Trials
                </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faClock} style={{ color: '#8B5CF6' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Active Free Trial Clients ({filtered.length})</span>
                    </div>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search trial company, owner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textWrap: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '11px' }}>
                                <th style={{ padding: '10px 14px' }}>COMPANY & OWNER</th>
                                <th style={{ padding: '10px 14px' }}>CONTACT</th>
                                <th style={{ padding: '10px 14px' }}>TRIAL STARTED</th>
                                <th style={{ padding: '10px 14px' }}>EXPIRATION DATE</th>
                                <th style={{ padding: '10px 14px' }}>DAYS REMAINING</th>
                                <th style={{ padding: '10px 14px' }}>STATUS</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t, idx) => (
                                <tr key={t.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.company_name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{t.owner_name}</div>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ color: '#334155' }}>{t.email}</div>
                                        <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{t.phone}</div>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748B' }}>{t.trial_started}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F172A' }}>{t.trial_expires}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ color: '#8B5CF6', fontWeight: '800' }}>{t.days_remaining} Days Left</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        {t.status === 'active' ? (
                                            <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                                ● Active Paid Plan
                                            </span>
                                        ) : (
                                            <span style={{ background: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                                ● Free Trial Active
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => { setSelectedCompany(t); setExtendModal(true); }}
                                            style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            <FontAwesomeIcon icon={faCalendarPlus} /> Extend Trial
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {extendModal && selectedCompany && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '420px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px', color: '#0F172A' }}>Extend Free Trial</h2>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Company: <strong>{selectedCompany.company_name}</strong></p>
                        <form onSubmit={handleExtendSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Extension Duration</label>
                                <select value={extraDays} onChange={(e) => setExtraDays(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}>
                                    <option value={3}>+ 3 Days Extension</option>
                                    <option value={7}>+ 7 Days Extension (1 Week)</option>
                                    <option value={14}>+ 14 Days Extension (2 Weeks)</option>
                                    <option value={30}>+ 30 Days Commercial Trial Extension</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button type="button" onClick={() => setExtendModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={extending} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                                    {extending ? 'Extending...' : 'Confirm Extension'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminTrials;
