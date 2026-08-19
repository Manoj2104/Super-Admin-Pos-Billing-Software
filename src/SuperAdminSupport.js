import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLifeRing, faReply, faCheckCircle, faSearch, faRotate, faComments } from '@fortawesome/free-solid-svg-icons';

const SuperAdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyModal, setReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const loadTickets = async (isMounted = true) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/saas-admin/support-tickets');
            if (isMounted && res.data && res.data.success) {
                setTickets(res.data.tickets || []);
            }
        } catch (err) {
            console.warn('SuperAdminSupport error', err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        loadTickets(isMounted);
        return () => { isMounted = false; };
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setReplying(true);
        try {
            const statusVal = document.getElementById('ticket-status-select')?.value || 'Resolved';
            const res = await axios.post('/api/saas-admin/reply-ticket', { 
                ticket_id: selectedTicket.id, 
                reply: replyText,
                status: statusVal
            });
            if (res.data && res.data.success) {
                showToast(res.data.message);
                setReplyModal(false);
                setSelectedTicket(null);
                setReplyText('');
                loadTickets();
            } else {
                alert('Reply failed: ' + (res.data.error || res.data.message));
            }
        } catch (err) {
            alert('Reply error: ' + (err.response?.data?.error || err.message));
        } finally {
            setReplying(false);
        }
    };

    const filtered = tickets.filter(t => {
        const q = searchQuery.toLowerCase();
        return (t.id && t.id.toLowerCase().includes(q)) ||
               (t.company_name && t.company_name.toLowerCase().includes(q)) ||
               (t.subject && t.subject.toLowerCase().includes(q));
    });

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <FontAwesomeIcon icon={faRotate} spin style={{ fontSize: '24px', color: '#10B981' }} />
                <div style={{ marginTop: '12px', fontWeight: '600' }}>Loading Support Tickets Helpdesk...</div>
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
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Support Tickets & Client Helpdesk</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Resolve technical help requests, hardware configuration queries, and billing support tickets.</p>
                </div>
                <button onClick={loadTickets} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faRotate} /> Refresh Tickets
                </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faLifeRing} style={{ color: '#2563EB' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Client Support Tickets ({filtered.length})</span>
                    </div>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search ticket ID, company, subject..."
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
                                <th style={{ padding: '10px 14px' }}>TICKET ID</th>
                                <th style={{ padding: '10px 14px' }}>COMPANY NAME</th>
                                <th style={{ padding: '10px 14px' }}>SUBJECT</th>
                                <th style={{ padding: '10px 14px' }}>PRIORITY</th>
                                <th style={{ padding: '10px 14px' }}>STATUS</th>
                                <th style={{ padding: '10px 14px' }}>SUBMITTED ON</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>{t.id}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>{t.company_name || 'Installer Wizard Setup'}</td>
                                    <td style={{ padding: '10px 14px', color: '#0F172A', fontWeight: '600', maxWidth: '320px', textWrap: 'wrap' }}>{t.subject}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: t.priority === 'High' ? '#FEF2F2' : '#EFF6FF', color: t.priority === 'High' ? '#DC2626' : '#2563EB', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: t.status === 'Open' ? '#FEF3C7' : '#ECFDF5', color: t.status === 'Open' ? '#D97706' : '#059669', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '11px' }}>{t.created_at}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <button onClick={() => { setSelectedTicket(t); setReplyModal(true); }} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={faReply} /> Reply Ticket
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reply Modal */}
            {replyModal && selectedTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '850px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'modalPop 0.2s ease-out' }}>
                        
                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFFFFF' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Support Ticket Helpdesk: {selectedTicket.id}</h2>
                                <span style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: '600' }}>Submitted on {selectedTicket.created_at}</span>
                            </div>
                            <button onClick={() => setReplyModal(false)} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', fontSize: '16px' }}>×</button>
                        </div>

                        {/* Modal Body Container (Scrollable) */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', background: '#F8FAFC' }}>
                            
                            {/* Left Column: Ticket Details & Screen Capture */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 10px' }}>Ticket Details</h3>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                                        <div>Company Name: <strong style={{ color: '#0F172A' }}>{selectedTicket.company_name || 'Installer Wizard Setup'}</strong></div>
                                        <div>Registered Email: <strong style={{ color: '#059669' }}>{selectedTicket.email}</strong></div>
                                        <div>Contact Phone: <strong style={{ color: '#0F172A' }}>{selectedTicket.phone || 'N/A'}</strong></div>
                                        <div>Issue Type: <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid #FCA5A5' }}>{selectedTicket.subject}</span></div>
                                    </div>
                                </div>

                                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 8px' }}>User Description</h3>
                                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, background: '#F1F5F9', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #059669', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                {/* SCREENSHOT CAPTURE DISPLAY */}
                                {selectedTicket.screenshot ? (
                                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>Screen Capture</h3>
                                            <button type="button" onClick={() => {
                                                const w = window.open();
                                                w.document.write(`<img src="${selectedTicket.screenshot}" style="max-width:100%;" />`);
                                            }} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📄 Fullscreen</button>
                                        </div>
                                        <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px', background: '#F1F5F9', textAlign: 'center', overflow: 'hidden' }}>
                                            <img src={selectedTicket.screenshot} alt="Client Screen Capture" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => {
                                                const w = window.open();
                                                w.document.write(`<img src="${selectedTicket.screenshot}" style="max-width:100%;" />`);
                                            }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                                        No Screen Capture Attached
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Resolution & Reply Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Super Admin Resolution Reply *</label>
                                        <textarea 
                                            required 
                                            rows="8" 
                                            value={replyText} 
                                            onChange={(e) => setReplyText(e.target.value)} 
                                            placeholder="Provide instructions, technical configuration steps, or software license recovery detail to client..." 
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'none', flex: 1, fontFamily: 'sans-serif' }} 
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Update Ticket Status</label>
                                        <select 
                                            id="ticket-status-select"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF' }}
                                        >
                                            <option value="Resolved">Resolved (Close Ticket)</option>
                                            <option value="In Progress">In Progress (Keep Open)</option>
                                            <option value="Open">Open</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                                        <button type="button" onClick={() => setReplyModal(false)} style={{ background: '#E2E8F0', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>Cancel</button>
                                        <button 
                                            type="submit" 
                                            disabled={replying} 
                                            style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '12.5px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}
                                        >
                                            {replying ? 'Sending Resolution...' : 'Send Resolution & Update'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSupport;
