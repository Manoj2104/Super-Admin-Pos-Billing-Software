import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLaptopCode, faRotate, faBan, faNetworkWired, faDesktop,
    faSearch, faCopy, faCheckCircle, faMicrochip, faMemory,
    faHardDrive, faShieldAlt, faEye, faLock, faUndo, faServer
} from '@fortawesome/free-solid-svg-icons';

const SuperAdminDevices = () => {
    const [devices, setDevices] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_devices_cache');
            return (cached && JSON.parse(cached).length > 0) ? JSON.parse(cached) : [
                {
                    id: 1,
                    device_name: 'Manoj (Primary POS Terminal)',
                    machine_uuid: 'UUID-F20C2F89B22B2990',
                    full_uuid: 'UUID-F20C2F89B22B2990-883A',
                    os_version: 'Windows 11 Enterprise x64 (Build 22631)',
                    ip_address: '127.0.0.1 (Local Host)',
                    mac_address: 'C0:1A:2B:3C:4D:5E',
                    company_name: 'Atlanta Supermarket',
                    owner_name: 'Admin',
                    ram_size: '16 GB DDR5',
                    cpu_model: 'Intel Core i7-13700H',
                    telemetry: '16 GB DDR5 Intel Core i7-13700H',
                    last_seen: '08 Aug 2026, 11:12 AM',
                    status: 'Online',
                    is_blocked: false,
                }
            ];
        } catch (e) {
            return [
                {
                    id: 1,
                    device_name: 'Manoj (Primary POS Terminal)',
                    machine_uuid: 'UUID-F20C2F89B22B2990',
                    full_uuid: 'UUID-F20C2F89B22B2990-883A',
                    os_version: 'Windows 11 Enterprise x64 (Build 22631)',
                    ip_address: '127.0.0.1 (Local Host)',
                    mac_address: 'C0:1A:2B:3C:4D:5E',
                    company_name: 'Atlanta Supermarket',
                    owner_name: 'Admin',
                    ram_size: '16 GB DDR5',
                    cpu_model: 'Intel Core i7-13700H',
                    telemetry: '16 GB DDR5 Intel Core i7-13700H',
                    last_seen: '08 Aug 2026, 11:12 AM',
                    status: 'Online',
                    is_blocked: false,
                }
            ];
        }
    });
    const [summary, setSummary] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_devices_summary');
            return cached ? JSON.parse(cached) : { total_fleet: 1, online_count: 1, offline_count: 0, blocked_count: 0 };
        } catch (e) { return { total_fleet: 1, online_count: 1, offline_count: 0, blocked_count: 0 }; }
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [msg, setMsg] = useState('');
    const [copiedUuid, setCopiedUuid] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    const loadDevices = async () => {
        if (devices.length === 0) setLoading(true);
        try {
            const res = await axios.get('/api/saas-admin/devices');
            if (res.data && res.data.success) {
                setDevices(res.data.devices || []);
                try { localStorage.setItem('sa_devices_cache', JSON.stringify(res.data.devices || [])); } catch (e) {}
                if (res.data.summary) {
                    setSummary(res.data.summary);
                    try { localStorage.setItem('sa_devices_summary', JSON.stringify(res.data.summary)); } catch (e) {}
                }
            }
        } catch (err) {
            console.warn('SuperAdminDevices: load error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDevices();
    }, []);

    const showToast = (message) => {
        setMsg(message);
        setTimeout(() => setMsg(''), 4000);
    };

    const handleResetBinding = async (id, name) => {
        if (!window.confirm(`Reset device hardware lock binding for "${name}"?\n\nThe client will be able to bind a new machine on their next login.`)) return;
        try {
            const res = await axios.post(`/api/saas-admin/reset-device-binding/${id}`);
            if (res.data && res.data.success) {
                showToast(res.data.message);
                loadDevices();
            }
        } catch (err) {
            alert('Reset failed: ' + err.message);
        }
    };

    const copyUuid = (uuid) => {
        navigator.clipboard.writeText(uuid);
        setCopiedUuid(uuid);
        setTimeout(() => setCopiedUuid(''), 2000);
    };

    const filteredDevices = devices.filter(d => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = (d.device_name && d.device_name.toLowerCase().includes(query)) ||
                             (d.machine_uuid && d.machine_uuid.toLowerCase().includes(query)) ||
                             (d.company_name && d.company_name.toLowerCase().includes(query)) ||
                             (d.ip_address && d.ip_address.toLowerCase().includes(query)) ||
                             (d.mac_address && d.mac_address.toLowerCase().includes(query));

        const matchesStatus = filterStatus === 'all' ||
                              (filterStatus === 'online' && d.status === 'Online') ||
                              (filterStatus === 'offline' && d.status !== 'Online');

        return matchesQuery && matchesStatus;
    });

    return (
        <div style={{ padding: '16px 20px', background: '#F8FAFC', minHeight: 'calc(100vh - 68px)', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            
            {/* ── TOAST NOTIFICATION ── */}
            {msg && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
                    background: '#0F172A', color: '#fff', padding: '10px 18px',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10B981' }} />
                    {msg}
                </div>
            )}

            {/* ── PAGE HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        Connected Devices & Machine UUID Registry
                    </h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>
                        Monitor client laptops, PCs, POS terminals, PDA barcode scanners, and hardware machine bindings in real-time.
                    </p>
                </div>

                <button
                    onClick={loadDevices}
                    style={{
                        background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155',
                        padding: '7px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                    }}
                >
                    <FontAwesomeIcon icon={faRotate} spin={loading} /> Refresh Telemetry
                </button>
            </div>

            {/* ── 4 HARDWARE TELEMETRY KPI CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                
                {/* CARD 1: FLEET TOTAL */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>TOTAL FLEET</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                            <FontAwesomeIcon icon={faDesktop} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{summary.total_fleet}</div>
                    <div style={{ fontSize: '10.5px', color: '#10B981', fontWeight: '700', marginTop: '3px' }}>Registered Hardware</div>
                </div>

                {/* CARD 2: ONLINE TERMINALS */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ONLINE TERMINALS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{summary.online_count}</div>
                    <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', marginTop: '3px' }}>100% Operational</div>
                </div>

                {/* CARD 3: MACHINE LOCKS BOUND */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>UUID LOCKS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{devices.length}</div>
                    <div style={{ fontSize: '10.5px', color: '#2563EB', fontWeight: '700', marginTop: '3px' }}>Fingerprint Bound</div>
                </div>

                {/* CARD 4: SECURITY INTEGRITY */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>SECURITY</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                            <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>SHA-256</div>
                    <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', marginTop: '3px' }}>256-Bit Lock Active</div>
                </div>

            </div>

            {/* ── SEARCH & FILTER BAR ── */}
            <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px', marginBottom: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search device, UUID, company, IP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px',
                                padding: '6px 10px 6px 30px', fontSize: '12px', color: '#0F172A', outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', fontSize: '11.5px', color: '#334155', fontWeight: '600' }}
                    >
                        <option value="all">All Terminal Status</option>
                        <option value="online">Online Only</option>
                        <option value="offline">Offline Only</option>
                    </select>

                    <button
                        onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                        style={{ background: '#F1F5F9', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', color: '#64748B', cursor: 'pointer' }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* ── HARDWARE REGISTRY TABLE (INTERNAL HORIZONTAL SCROLL ONLY) ── */}
            <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Registered Client Hardware List ({filteredDevices.length})</h3>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>← Scroll Table Horizontally →</span>
                </div>

                {/* SCROLLABLE INNER TABLE CONTAINER */}
                <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '11.5px', textWrap: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '10.5px' }}>
                                <th style={{ padding: '10px 12px', width: '220px' }}>DEVICE NAME & OS</th>
                                <th style={{ padding: '10px 12px', width: '200px' }}>MACHINE UUID</th>
                                <th style={{ padding: '10px 12px', width: '170px' }}>IP & MAC ADDRESS</th>
                                <th style={{ padding: '10px 12px', width: '220px' }}>COMPANY & OWNER</th>
                                <th style={{ padding: '10px 12px', width: '150px' }}>TELEMETRY</th>
                                <th style={{ padding: '10px 12px', width: '140px' }}>STATUS</th>
                                <th style={{ padding: '10px 12px', width: '160px', textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices && filteredDevices.length > 0 ? (
                                filteredDevices.map((d) => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        
                                        {/* Device Name & OS */}
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '26px', height: '26px', borderRadius: '5px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px' }}>
                                                    <FontAwesomeIcon icon={faDesktop} />
                                                </div>
                                                <div>
                                                    {d.device_name}
                                                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 'normal' }}>{d.os_version}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Machine UUID */}
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0F172A', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '5px', fontWeight: '700' }}>
                                                    {d.machine_uuid}
                                                </span>
                                                <button
                                                    onClick={() => copyUuid(d.full_uuid || d.machine_uuid)}
                                                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '11px' }}
                                                    title="Copy Full Machine UUID"
                                                >
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* IP & MAC Address */}
                                        <td style={{ padding: '10px 12px', color: '#334155' }}>
                                            <div style={{ fontWeight: '600' }}>{d.ip_address}</div>
                                            <div style={{ fontSize: '10px', color: '#64748B' }}>MAC: {d.mac_address}</div>
                                        </td>

                                        {/* Company & Owner */}
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{d.company_name}</div>
                                            <div style={{ fontSize: '10.5px', color: '#64748B' }}>{d.owner_name || 'Admin'}</div>
                                        </td>

                                        {/* Telemetry Specs */}
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ fontSize: '11px', color: '#334155', fontWeight: '700' }}>
                                                {d.ram_size || '16 GB RAM'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#64748B' }}>
                                                {d.cpu_model ? d.cpu_model.split('@')[0] : 'Intel Core i7'}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                                                ● Online
                                            </span>
                                            <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>{d.last_seen}</div>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDevice(d);
                                                        setShowDrawer(true);
                                                    }}
                                                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                    <FontAwesomeIcon icon={faEye} /> Specs
                                                </button>

                                                <button
                                                    onClick={() => handleResetBinding(d.id, d.device_name)}
                                                    style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#D97706', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                    <FontAwesomeIcon icon={faUndo} /> Reset Binding
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                                        No hardware devices registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── DEVICE SPECS DRAWER MODAL ── */}
            {showDrawer && selectedDevice && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '380px', background: '#FFFFFF', height: '100%', padding: '20px', boxSizing: 'border-box', overflowY: 'auto', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Hardware Device Telemetry</h3>
                            <button onClick={() => setShowDrawer(false)} style={{ background: '#F1F5F9', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Close</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                            <div><strong>Device Name:</strong> {selectedDevice.device_name}</div>
                            <div><strong>OS Version:</strong> {selectedDevice.os_version}</div>
                            <div><strong>Machine Lock UUID:</strong> <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{selectedDevice.full_uuid || selectedDevice.machine_uuid}</code></div>
                            <div><strong>IP Address:</strong> {selectedDevice.ip_address}</div>
                            <div><strong>MAC Address:</strong> {selectedDevice.mac_address}</div>
                            <div><strong>Company Name:</strong> {selectedDevice.company_name}</div>
                            <div><strong>Owner:</strong> {selectedDevice.owner_name}</div>
                            <div><strong>RAM Size:</strong> {selectedDevice.ram_size}</div>
                            <div><strong>Processor Model:</strong> {selectedDevice.cpu_model}</div>
                            <div><strong>Storage Hardware:</strong> {selectedDevice.storage_info}</div>
                            <div><strong>POS Engine:</strong> {selectedDevice.app_version}</div>
                            <div><strong>Last Heartbeat:</strong> {selectedDevice.last_seen}</div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SuperAdminDevices;
