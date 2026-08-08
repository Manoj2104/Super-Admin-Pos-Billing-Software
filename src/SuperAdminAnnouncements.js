import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPlus, faCheckCircle, faRotate, faToggleOn, faToggleOff, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const SuperAdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('Warning');
    const [audience, setAudience] = useState('All Clients');
    const [submitting, setSubmitting] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/saas-admin/announcements-list');
            if (res.data && res.data.success) {
                setAnnouncements(res.data.announcements || []);
            }
        } catch (err) {
            console.warn('SuperAdminAnnouncements error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post('/api/saas-admin/announcement/create', { title, message, priority, audience });
            if (res.data && res.data.success) {
                showToast('Broadcast Announcement created successfully!');
                setShowCreateModal(false);
                setTitle('');
                setMessage('');
                loadData();
            } else {
                alert('Create failed: ' + (res.data.error || res.data.message));
            }
        } catch (err) {
            alert('Create error: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <FontAwesomeIcon icon={faRotate} spin style={{ fontSize: '24px', color: '#10B981' }} />
                <div style={{ marginTop: '12px', fontWeight: '600' }}>Loading Broadcast Control Center...</div>
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
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Broadcast & System Banners</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Broadcast instant warning banners, maintenance notices, and feature releases across all POS client portals.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faPlus} /> New Broadcast Notice
                </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faBullhorn} style={{ color: '#D97706' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Active Broadcast Announcements ({announcements.length})</span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textWrap: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '11px' }}>
                                <th style={{ padding: '10px 14px' }}>TITLE</th>
                                <th style={{ padding: '10px 14px' }}>MESSAGE BODY</th>
                                <th style={{ padding: '10px 14px' }}>PRIORITY</th>
                                <th style={{ padding: '10px 14px' }}>AUDIENCE</th>
                                <th style={{ padding: '10px 14px' }}>BROADCAST DATE</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((a) => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: '800', color: '#0F172A' }}>{a.title}</td>
                                    <td style={{ padding: '10px 14px', color: '#334155', maxWidth: '380px', textWrap: 'wrap' }}>{a.message}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: a.priority === 'Warning' ? '#FEF3C7' : '#EFF6FF', color: a.priority === 'Warning' ? '#D97706' : '#2563EB', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            {a.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontWeight: '600' }}>{a.audience}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '11px' }}>{a.created_at}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            Broadcasting Live
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '480px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px', color: '#0F172A' }}>Broadcast New System Announcement</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled System Upgrade Notice..." style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Broadcast Message</label>
                                <textarea required rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter details to display on client dashboard banners..." style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Priority Level</label>
                                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                        <option value="Warning">Warning (Yellow Banner)</option>
                                        <option value="Critical">Critical Alert (Red Banner)</option>
                                        <option value="Info">Feature Release (Blue Banner)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Target Audience</label>
                                    <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                        <option value="All Clients">All Registered Clients</option>
                                        <option value="Trial Clients">Trial Clients Only</option>
                                        <option value="Premium Clients">Premium Clients Only</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                                    {submitting ? 'Broadcasting...' : 'Publish Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminAnnouncements;
