import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faDownload, faSearch, faRotate, faFilePdf, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const SuperAdminInvoices = () => {
    const [invoices, setInvoices] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_invoices_cache');
            return cached ? JSON.parse(cached) : [
                {
                    id: 1,
                    invoice_number: 'INV-2026-0801',
                    company_name: 'Atlanta Supermarket',
                    gst_number: '33AABCU9603R1ZM',
                    amount: '₹499.00',
                    gst_amount: '₹89.82 (GST 18%)',
                    total: '₹588.82',
                    date: '08 Aug 2026',
                    status: 'Paid',
                },
                {
                    id: 2,
                    invoice_number: 'INV-2026-0802',
                    company_name: 'New Store Registration',
                    gst_number: '33AABCU9603R1ZM',
                    amount: '₹499.00',
                    gst_amount: '₹89.82 (GST 18%)',
                    total: '₹588.82',
                    date: '08 Aug 2026',
                    status: 'Paid',
                }
            ];
        } catch (e) {
            return [];
        }
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadInvoices = async () => {
        try {
            const res = await axios.get('/api/saas-admin/invoices-list');
            if (res.data && res.data.success) {
                setInvoices(res.data.invoices || []);
                try { localStorage.setItem('sa_invoices_cache', JSON.stringify(res.data.invoices || [])); } catch (e) {}
            }
        } catch (err) {
            console.warn('SuperAdminInvoices error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const filtered = invoices.filter(inv => {
        const q = searchQuery.toLowerCase();
        return (inv.invoice_number && inv.invoice_number.toLowerCase().includes(q)) ||
               (inv.company_name && inv.company_name.toLowerCase().includes(q)) ||
               (inv.gst_number && inv.gst_number.toLowerCase().includes(q));
    });

    return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Tax Invoices & GST Returns</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Manage B2B/B2C tax invoices, GST 18% breakdowns, and automated client billing receipts.</p>
                </div>
                <button onClick={loadInvoices} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faRotate} /> Refresh Invoices
                </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faFileInvoice} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Enterprise Tax Invoices ({filtered.length})</span>
                    </div>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search invoice number, GST..."
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
                                <th style={{ padding: '10px 14px' }}>INVOICE #</th>
                                <th style={{ padding: '10px 14px' }}>COMPANY & GSTIN</th>
                                <th style={{ padding: '10px 14px' }}>PLAN DESCRIPTION</th>
                                <th style={{ padding: '10px 14px' }}>SUBTOTAL</th>
                                <th style={{ padding: '10px 14px' }}>GST (18%)</th>
                                <th style={{ padding: '10px 14px' }}>TOTAL</th>
                                <th style={{ padding: '10px 14px' }}>STATUS</th>
                                <th style={{ padding: '10px 14px' }}>ISSUED DATE</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inv, idx) => (
                                <tr key={inv.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>{inv.invoice_number}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ fontWeight: '700', color: '#334155' }}>{inv.company_name}</div>
                                        <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>GSTIN: {inv.gst_number}</div>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '600' }}>{inv.plan_name}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748B' }}>₹{Number(inv.subtotal).toFixed(2)}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748B' }}>₹{Number(inv.gst_amount).toFixed(2)}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '800', color: '#10B981' }}>₹{Number(inv.total_amount).toFixed(2)}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '11px' }}>{inv.issued_at}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <button onClick={() => window.open(`/api/saas-admin/invoice-download/${inv.id}`, '_blank')} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <FontAwesomeIcon icon={faFilePdf} style={{ color: '#DC2626' }} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminInvoices;
