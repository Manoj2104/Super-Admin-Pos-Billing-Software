import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownloadAlt, faDatabase, faPlus, faCheckCircle, faRotate, faDownload, faHardDrive, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const SuperAdminBackups = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const loadBackups = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/saas-admin/backups-list');
            if (res.data && res.data.success) {
                setBackups(res.data.backups || []);
            }
        } catch (err) {
            console.warn('SuperAdminBackups error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackups();
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const handleCreateBackup = async (type) => {
        setBackingUp(true);
        try {
            const res = await axios.post('/api/saas/backup/now');
            if (res.data && res.data.success) {
                showToast(res.data.message || 'Backup archive created successfully!');
                loadBackups();
            } else {
                alert('Backup failed: ' + (res.data.error || res.data.message));
            }
        } catch (err) {
            alert('Backup error: ' + (err.response?.data?.error || err.message));
        } finally {
            setBackingUp(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <FontAwesomeIcon icon={faRotate} spin style={{ fontSize: '24px', color: '#10B981' }} />
                <div style={{ marginTop: '12px', fontWeight: '600' }}>Loading Disaster Recovery & Backup Control Center...</div>
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
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Backup & Disaster Recovery Center</h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>Trigger instant database SQL dumps, system zip snapshots, and manage cloud backup archives.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleCreateBackup('sql')} disabled={backingUp} style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FontAwesomeIcon icon={faDatabase} /> {backingUp ? 'Creating SQL Dump...' : 'Backup Database SQL Now'}
                    </button>
                    <button onClick={() => handleCreateBackup('zip')} disabled={backingUp} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FontAwesomeIcon icon={faCloudDownloadAlt} /> Backup Full System ZIP
                    </button>
                </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faHardDrive} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Available Backup Snapshots ({backups.length})</span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textWrap: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '11px' }}>
                                <th style={{ padding: '10px 14px' }}>FILE NAME</th>
                                <th style={{ padding: '10px 14px' }}>BACKUP TYPE</th>
                                <th style={{ padding: '10px 14px' }}>FILE SIZE</th>
                                <th style={{ padding: '10px 14px' }}>CREATED TIMESTAMP</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.map((b) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>{b.filename}</td>
                                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '600' }}>{b.type}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>{b.size}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '11px' }}>{b.created_at}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        <a href="/api/saas/backup/download-sql" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                            <button style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <FontAwesomeIcon icon={faDownload} /> Download Archive
                                            </button>
                                        </a>
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

export default SuperAdminBackups;
