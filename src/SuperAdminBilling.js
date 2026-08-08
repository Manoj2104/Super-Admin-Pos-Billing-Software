import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard, faDollarSign, faSyncAlt, faCheckCircle, faTimesCircle,
    faReceipt, faDownload, faExchangeAlt, faShieldAlt, faSearch, faRotate
} from '@fortawesome/free-solid-svg-icons';

const SuperAdminBilling = () => {
    const [payments, setPayments] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_payments_cache');
            return cached ? JSON.parse(cached) : [
                {
                    id: 1,
                    payment_id: 'PAY-2026-8831',
                    company_name: 'Atlanta Supermarket',
                    plan_name: 'INFY-POS PREMIUM',
                    amount: '₹499.00',
                    gateway: 'Razorpay',
                    status: 'Success',
                    date: '08 Aug 2026, 10:45 AM'
                },
                {
                    id: 2,
                    payment_id: 'PAY-2026-8832',
                    company_name: 'New Store Registration',
                    plan_name: 'INFY-POS PREMIUM',
                    amount: '₹499.00',
                    gateway: 'Razorpay',
                    status: 'Success',
                    date: '08 Aug 2026, 11:15 AM'
                }
            ];
        } catch (e) { return []; }
    });
    const [gateways, setGateways] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_gateways_cache');
            return cached ? JSON.parse(cached) : [
                { name: 'Razorpay Live API', status: 'Healthy', uptime: '99.98%', mode: 'Live Production' },
                { name: 'Stripe Global Gateway', status: 'Healthy', uptime: '100%', mode: 'Live Production' },
                { name: 'UPI AutoPay (NPCI)', status: 'Healthy', uptime: '99.95%', mode: 'Live Production' }
            ];
        } catch (e) { return []; }
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        try {
            const res = await axios.get('/api/saas-admin/billing-payments');
            if (res.data && res.data.success) {
                setPayments(res.data.payments || []);
                setGateways(res.data.gateways || []);
                try {
                    localStorage.setItem('sa_payments_cache', JSON.stringify(res.data.payments || []));
                    localStorage.setItem('sa_gateways_cache', JSON.stringify(res.data.gateways || []));
                } catch (e) {}
            }
        } catch (err) {
            console.warn('SuperAdminBilling error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredPayments = payments.filter(p => {
        const q = searchQuery.toLowerCase();
        return (p.company_name && p.company_name.toLowerCase().includes(q)) ||
               (p.payment_id && p.payment_id.toLowerCase().includes(q)) ||
               (p.plan_name && p.plan_name.toLowerCase().includes(q));
    });

    return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Billing & Payment Gateways</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Monitor real-time payment transactions, gateway health, and billing logs across INFY-POS SaaS.</p>
                </div>
                <button onClick={loadData} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faRotate} /> Refresh Telemetry
                </button>
            </div>

            {/* Gateway Telemetry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {gateways.map((g, idx) => (
                    <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{g.name}</span>
                            <span style={{ background: g.status === 'Active' ? '#ECFDF5' : '#F1F5F9', color: g.status === 'Active' ? '#059669' : '#64748B', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                {g.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' }}>{g.mrr}</div>
                        <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: '600' }}>● {g.health}</div>
                    </div>
                ))}
            </div>

            {/* Search & Transactions Table */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faCreditCard} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Real-Time Payment Logs</span>
                    </div>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search payment ID, company..."
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
                                <th style={{ padding: '10px 14px' }}>PAYMENT ID</th>
                                <th style={{ padding: '10px 14px' }}>COMPANY</th>
                                <th style={{ padding: '10px 14px' }}>PLAN</th>
                                <th style={{ padding: '10px 14px' }}>AMOUNT</th>
                                <th style={{ padding: '10px 14px' }}>GATEWAY</th>
                                <th style={{ padding: '10px 14px' }}>STATUS</th>
                                <th style={{ padding: '10px 14px' }}>TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((p, idx) => (
                                <tr key={p.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>{p.payment_id}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>{p.company_name}</td>
                                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '600' }}>{p.plan_name}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '800', color: p.amount > 0 ? '#10B981' : '#64748B' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748B' }}>{p.gateway}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: p.status === 'Comped' ? '#FEF3C7' : '#ECFDF5', color: p.status === 'Comped' ? '#D97706' : '#059669', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '11px' }}>{p.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminBilling;
