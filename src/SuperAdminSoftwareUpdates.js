/**
 * SuperAdminSoftwareUpdates.js
 *
 * Super Admin — Software Updates Management Page
 * Full CRUD: Create, Upload, Preview, Publish, Archive releases.
 * Matches the existing BILLRYS-POS premium green/white enterprise UI.
 */
import React, { useState, useEffect, useRef } from 'react';

// ─── Icon helpers ─────────────────────────────────────────────
const Icon = ({ path, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const UploadIcon = () => <Icon size={18} path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
const PlusIcon   = () => <Icon size={16} path="M12 5v14M5 12h14" />;
const CheckIcon  = () => <Icon size={14} path="M20 6 9 17l-5-5" />;
const AlertIcon  = () => <Icon size={14} path="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;

// ─── API helpers ──────────────────────────────────────────────
const getToken = () => localStorage.getItem('token') || localStorage.getItem('admin_token') || '';

async function apiFetch(url, options = {}) {
    const token = getToken();
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'API Error');
    return json;
}

// ─── Status badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        published: { background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' },
        draft:     { background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' },
        archived:  { background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' },
    };
    const s = styles[status] || styles.draft;
    const labels = { published: '● Published', draft: '◌ Draft', archived: '⊘ Archived' };
    return (
        <span style={{ ...s, borderRadius: 12, padding: '2px 10px', fontSize: 11.5, fontWeight: 700 }}>
            {labels[status] || status}
        </span>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
const SuperAdminSoftwareUpdates = () => {
    const [releases, setReleases]             = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast]                   = useState(null);
    const [currentProductionVersion, setCurrentProductionVersion] = useState('1.0.0');
    const [latestPublishedVersion, setLatestPublishedVersion]     = useState('—');
    const [latestPublishedStatus, setLatestPublishedStatus]       = useState('');
    const [confirmAction, setConfirmAction]   = useState(null); // { type, releaseId, version }
    const [actionLoading, setActionLoading]   = useState(false);
    const [activeTab, setActiveTab]           = useState('releases'); // releases | audit

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Fetch release list ──────────────────────────────────────
    const fetchReleases = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/admin/software-updates');
            setReleases(data.data || []);
            setCurrentProductionVersion(data.current_production_version || '1.0.0');
            setLatestPublishedVersion(data.latest_published_version || '—');
            setLatestPublishedStatus(data.latest_published_status || '');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReleases(); }, []);

    // ── Publish ────────────────────────────────────────────────
    const handlePublish = async (id) => {
        setActionLoading(true);
        try {
            const res = await apiFetch(`/api/admin/software-updates/${id}/publish`, { method: 'POST' });
            showToast(res.message || 'Release published successfully!');
            setConfirmAction(null);
            fetchReleases();
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Archive ────────────────────────────────────────────────
    const handleArchive = async (id) => {
        setActionLoading(true);
        try {
            await apiFetch(`/api/admin/software-updates/${id}/archive`, { method: 'POST' });
            showToast('Release archived.');
            setConfirmAction(null);
            fetchReleases();
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async (id) => {
        setActionLoading(true);
        try {
            await apiFetch(`/api/admin/software-updates/${id}`, { method: 'DELETE' });
            showToast('Release deleted.');
            setConfirmAction(null);
            fetchReleases();
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div style={{ padding: '28px 0', minHeight: '80vh', background: '#F8FAFC' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 24, zIndex: 99999,
                    background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#A7F3D0'}`,
                    color: toast.type === 'error' ? '#DC2626' : '#065F46',
                    borderRadius: 10, padding: '12px 20px',
                    fontSize: 13.5, fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', gap: 8, minWidth: 260,
                    animation: 'slideIn 0.2s ease',
                }}>
                    {toast.type === 'error' ? <AlertIcon /> : <CheckIcon />}
                    {toast.msg}
                </div>
            )}

            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Software Updates
                        </h2>
                        <p style={{ fontSize: 13.5, color: '#6B7280', margin: '4px 0 0', fontWeight: 400 }}>
                            Manage software releases for all client installations.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            background: 'linear-gradient(135deg,#059669,#10B981)',
                            border: 'none', color: '#fff', borderRadius: 10,
                            padding: '10px 20px', fontSize: 13.5, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                        }}
                    >
                        <PlusIcon /> Create New Release
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    {
                        label: 'Current Production Version',
                        value: currentProductionVersion,
                        icon: '🖥️',
                        color: '#3B82F6',
                        bg: '#EFF6FF',
                    },
                    {
                        label: 'Latest Published Version',
                        value: latestPublishedVersion,
                        icon: '✅',
                        color: '#10B981',
                        bg: '#ECFDF5',
                        badge: latestPublishedStatus === 'published' ? 'Published' : null,
                    },
                    {
                        label: 'Total Releases',
                        value: String(releases.length),
                        icon: '📦',
                        color: '#8B5CF6',
                        bg: '#F5F3FF',
                    },
                    {
                        label: 'Published Releases',
                        value: String(releases.filter(r => r.status === 'published').length),
                        icon: '🚀',
                        color: '#F59E0B',
                        bg: '#FFFBEB',
                    },
                ].map(({ label, value, icon, color, bg, badge }) => (
                    <div key={label} style={{
                        background: '#fff', border: '1px solid #E2E8F0',
                        borderRadius: 12, padding: '18px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{
                                fontSize: 20, width: 38, height: 38, borderRadius: 10,
                                background: bg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                            }}>{icon}</span>
                            {badge && (
                                <span style={{
                                    background: '#DCFCE7', color: '#15803D',
                                    border: '1px solid #86EFAC', borderRadius: 20,
                                    padding: '1px 8px', fontSize: 10.5, fontWeight: 700,
                                }}>{badge}</span>
                            )}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: color }}>{value}</div>
                        <div style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {[
                    { id: 'releases', label: '📋 Release History' },
                    { id: 'audit',    label: '📊 Audit Logs' },
                ].map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            padding: '8px 18px', borderRadius: 8, border: 'none',
                            background: activeTab === id ? '#059669' : '#F1F5F9',
                            color: activeTab === id ? '#fff' : '#6B7280',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13.5 }}>
                    <AlertIcon /> {error}
                </div>
            )}

            {/* Release History Table */}
            {activeTab === 'releases' && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Release History</div>
                    </div>

                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                            Loading releases...
                        </div>
                    ) : releases.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No releases yet</div>
                            <div style={{ fontSize: 13, color: '#9CA3AF' }}>Create your first release to get started.</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', color: '#6B7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {['Version', 'Release Name', 'Status', 'Release Date', 'File Size', 'Published By', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {releases.map((r, idx) => (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6', background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669', fontSize: 13 }}>
                                                v{r.version}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 500 }}>
                                                {r.release_name}
                                                {r.is_mandatory && (
                                                    <span style={{ marginLeft: 6, background: '#FEF3C7', color: '#B45309', borderRadius: 6, padding: '1px 6px', fontSize: 10.5, fontWeight: 700 }}>
                                                        Mandatory
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                                            <td style={{ padding: '12px 16px', color: '#6B7280' }}>{r.release_date || '—'}</td>
                                            <td style={{ padding: '12px 16px', color: '#6B7280' }}>{r.file_size_human || '—'}</td>
                                            <td style={{ padding: '12px 16px', color: '#6B7280' }}>{r.published_by_name || '—'}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {r.status === 'draft' && (
                                                        <button
                                                            onClick={() => setConfirmAction({ type: 'publish', releaseId: r.id, version: r.version })}
                                                            style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            🚀 Publish
                                                        </button>
                                                    )}
                                                    {r.status === 'published' && (
                                                        <button
                                                            onClick={() => setConfirmAction({ type: 'archive', releaseId: r.id, version: r.version })}
                                                            style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                    {r.status === 'draft' && (
                                                        <button
                                                            onClick={() => setConfirmAction({ type: 'delete', releaseId: r.id, version: r.version })}
                                                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                    {r.download_url && (
                                                        <a
                                                            href={r.download_url}
                                                            download
                                                            style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            ↓ Package
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && <AuditLogsPanel />}

            {/* Confirm Action Modal */}
            {confirmAction && (
                <ConfirmModal
                    action={confirmAction}
                    loading={actionLoading}
                    onCancel={() => setConfirmAction(null)}
                    onConfirm={() => {
                        if (confirmAction.type === 'publish') handlePublish(confirmAction.releaseId);
                        if (confirmAction.type === 'archive') handleArchive(confirmAction.releaseId);
                        if (confirmAction.type === 'delete')  handleDelete(confirmAction.releaseId);
                    }}
                />
            )}

            {/* Create Release Modal */}
            {showCreateModal && (
                <CreateReleaseModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); fetchReleases(); showToast('Release draft created!'); }}
                />
            )}

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
            `}</style>
        </div>
    );
};

// ─── Audit Logs Panel ─────────────────────────────────────────
const AuditLogsPanel = () => {
    const [logs, setLogs]       = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await apiFetch('/api/admin/software-updates/audit-logs?per_page=50');
                setLogs(data.data?.data || data.data || []);
            } catch (_) {}
            finally { setLoading(false); }
        };
        fetchLogs();
    }, []);

    const eventColor = (ev) => {
        if (ev.includes('publish') || ev.includes('success')) return '#15803D';
        if (ev.includes('fail') || ev.includes('error'))      return '#DC2626';
        if (ev.includes('archive') || ev.includes('delete'))  return '#B45309';
        return '#475569';
    };

    return (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Update Audit Logs</div>
            </div>
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
            ) : logs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No audit events recorded yet.</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', color: '#6B7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                {['Event', 'Version', 'Previous', 'Message', 'Status', 'Time'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 600, color: eventColor(log.event) }}>{log.event}</td>
                                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>{log.version ? `v${log.version}` : '—'}</td>
                                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{log.previous_version ? `v${log.previous_version}` : '—'}</td>
                                    <td style={{ padding: '10px 14px', color: '#374151', maxWidth: 300 }}>{log.message || '—'}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{
                                            background: log.status === 'success' ? '#DCFCE7' : log.status === 'error' ? '#FEE2E2' : '#F1F5F9',
                                            color:      log.status === 'success' ? '#15803D' : log.status === 'error' ? '#DC2626' : '#475569',
                                            borderRadius: 6, padding: '2px 8px', fontSize: 11.5, fontWeight: 700,
                                        }}>{log.status}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#9CA3AF', fontSize: 12, whiteSpace: 'nowrap' }}>
                                        {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Confirm Action Modal ─────────────────────────────────────
const ConfirmModal = ({ action, loading, onCancel, onConfirm }) => {
    const configs = {
        publish: {
            title:   `Publish Release v${action.version}?`,
            body:    'This will make the update available to all compatible client installations. Make sure the installer package and SHA-256 checksum are correct.',
            btnText: '🚀 Publish Now',
            btnStyle: { background: '#059669', color: '#fff' },
        },
        archive: {
            title:   `Archive Release v${action.version}?`,
            body:    'This will remove the release from the client update feed. Existing installations already on this version will not be affected.',
            btnText: 'Archive',
            btnStyle: { background: '#F59E0B', color: '#fff' },
        },
        delete: {
            title:   `Delete Draft v${action.version}?`,
            body:    'This will permanently delete the draft release and its uploaded package file. This action cannot be undone.',
            btnText: 'Delete',
            btnStyle: { background: '#DC2626', color: '#fff' },
        },
    };
    const cfg = configs[action.type];

    return (
        <>
            <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9997 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', zIndex: 9998,
                background: '#fff', borderRadius: 14, padding: 28,
                width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>{cfg.title}</div>
                <div style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.5, marginBottom: 22 }}>{cfg.body}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} disabled={loading}
                        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, padding: '9px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        style={{ ...cfg.btnStyle, border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Processing...' : cfg.btnText}
                    </button>
                </div>
            </div>
        </>
    );
};

// ─── Create Release Modal ─────────────────────────────────────
const CreateReleaseModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({
        version:              '',
        release_name:         '',
        description:          '',
        release_notes_raw:    '',
        release_type:         'stable',
        is_mandatory:         false,
        min_supported_version:'1.0.0',
        target:               'all',
        release_date:         new Date().toISOString().split('T')[0],
    });
    const [file, setFile]         = useState(null);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [sha256, setSha256]     = useState('');
    const [fileSize, setFileSize] = useState(0);
    const fileInputRef            = useRef();

    const handleFileChange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setFileSize(f.size);

        // Calculate SHA-256 client-side for preview
        try {
            const buf    = await f.arrayBuffer();
            const hash   = await crypto.subtle.digest('SHA-256', buf);
            const hex    = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
            setSha256(hex);
        } catch (_) { setSha256('(Will be calculated on server)'); }
    };

    const handleSubmit = async (publish = false) => {
        setLoading(true);
        setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'release_notes_raw') {
                    // Convert textarea lines to JSON array of strings
                    const notes = v.split('\n').map(l => l.trim()).filter(Boolean);
                    fd.append('release_notes', JSON.stringify(notes));
                } else {
                    fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
                }
            });
            if (file) fd.append('package_file', file);

            const token = getToken();
            const res = await fetch('/api/admin/software-updates', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: fd,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || Object.values(json.errors || {}).flat().join(' '));

            // If "Publish" clicked, also publish immediately
            if (publish && json.data?.id) {
                await apiFetch(`/api/admin/software-updates/${json.data.id}/publish`, { method: 'POST' });
            }

            onCreated();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (b) => {
        if (!b) return '—';
        if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
        return Math.round(b / 1024) + ' KB';
    };

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9997 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', zIndex: 9998,
                background: '#fff', borderRadius: 16,
                width: '100%', maxWidth: 580,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
            }}>
                {/* Modal Header */}
                <div style={{ background: 'linear-gradient(135deg,#064E3B,#059669)', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>✨ Create New Release</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>Deploy a new BILLRYS-POS update to all client installations</div>
                </div>

                <div style={{ padding: '22px 24px' }}>
                    {error && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                            <AlertIcon /> {error}
                        </div>
                    )}

                    {/* Version & Release Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Version *</label>
                            <input style={inputStyle} placeholder="e.g. 1.1.0"
                                value={form.version}
                                onChange={e => setForm(p => ({ ...p, version: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Release Name *</label>
                            <input style={inputStyle} placeholder="e.g. October 2026 Update"
                                value={form.release_name}
                                onChange={e => setForm(p => ({ ...p, release_name: e.target.value }))} />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Release Description</label>
                        <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }}
                            placeholder="Brief description of this release..."
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    {/* Release Notes */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Release Notes (one per line)</label>
                        <textarea style={{ ...inputStyle, height: 90, resize: 'vertical', fontFamily: 'monospace', fontSize: 12.5 }}
                            placeholder={"New purchase workflow\nFaster product search\nImproved barcode handling\nBug fixes"}
                            value={form.release_notes_raw}
                            onChange={e => setForm(p => ({ ...p, release_notes_raw: e.target.value }))} />
                        <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 3 }}>Each line becomes a separate release note shown to clients.</div>
                    </div>

                    {/* Release Type + Mandatory + Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Release Type</label>
                            <select style={inputStyle} value={form.release_type}
                                onChange={e => setForm(p => ({ ...p, release_type: e.target.value }))}>
                                <option value="stable">Stable</option>
                                <option value="beta">Beta</option>
                                <option value="hotfix">Hotfix</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Release Date</label>
                            <input type="date" style={inputStyle} value={form.release_date}
                                onChange={e => setForm(p => ({ ...p, release_date: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Min. Supported Version</label>
                            <input style={inputStyle} placeholder="1.0.0"
                                value={form.min_supported_version}
                                onChange={e => setForm(p => ({ ...p, min_supported_version: e.target.value }))} />
                        </div>
                    </div>

                    {/* Mandatory Toggle */}
                    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            onClick={() => setForm(p => ({ ...p, is_mandatory: !p.is_mandatory }))}
                            style={{
                                width: 44, height: 24, borderRadius: 12, border: 'none',
                                background: form.is_mandatory ? '#059669' : '#D1D5DB',
                                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                            }}
                        >
                            <span style={{
                                position: 'absolute', top: 3, left: form.is_mandatory ? 22 : 3,
                                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                        <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Mandatory Update</span>
                            <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>
                                {form.is_mandatory ? '(Users must update before using POS)' : '(Optional — users can postpone)'}
                            </span>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Upload Installer Package (EXE/ZIP/MSI)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #D1D5DB', borderRadius: 10,
                                padding: '20px 16px', textAlign: 'center',
                                cursor: 'pointer', background: '#FAFAFA',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#10B981'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                        >
                            <UploadIcon />
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', marginTop: 8 }}>
                                {file ? file.name : 'Click to select installer file'}
                            </div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
                                {file ? `Size: ${formatBytes(fileSize)}` : 'EXE, ZIP, or MSI — max 500 MB'}
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".exe,.zip,.msi"
                            style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>

                    {/* SHA-256 preview */}
                    {sha256 && (
                        <div style={{ marginBottom: 14, background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 3 }}>SHA-256 Checksum</div>
                            <code style={{ fontSize: 11, wordBreak: 'break-all', color: '#374151' }}>{sha256}</code>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
                        <button onClick={onClose} disabled={loading}
                            style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, padding: '10px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={() => handleSubmit(false)} disabled={loading}
                            style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#374151', borderRadius: 8, padding: '10px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button onClick={() => handleSubmit(true)} disabled={loading}
                            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Publishing...' : '🚀 Publish Update'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#374151',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB',
    borderRadius: 8, fontSize: 13.5, color: '#111827',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
};

export default SuperAdminSoftwareUpdates;
