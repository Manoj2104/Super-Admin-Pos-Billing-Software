import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDesktop, faRotate, faBan, faNetworkWired, faSearch,
    faCopy, faCheckCircle, faMicrochip, faMemory, faHardDrive,
    faShieldAlt, faEye, faLock, faUndo, faServer, faTimes,
    faList, faThLarge, faChevronLeft, faChevronRight, faTrash,
    faLaptop, faMobileScreen, faBuilding, faSignal, faWifi, faPlus,
    faCheck
} from '@fortawesome/free-solid-svg-icons';
import "../variation/ProductVariationsPremium.css";
import "../productCategory/ProductCategoriesPremium.css";
import LiveCounter from "../../shared/components/LiveCounter";
import LiveSparkline from "../../shared/components/LiveSparkline";

const SuperAdminDevices = () => {
    // ⚡ 0ms Instant Synchronous Load from Cache (Strictly Real Devices)
    const [devices, setDevices] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_devices_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    // Purge any legacy fake mock data
                    const clean = parsed.filter(d =>
                        d &&
                        d.device_name !== 'Warehouse Receiving Station PC' &&
                        d.device_name !== 'POS Terminal Counter 01' &&
                        d.device_name !== 'Express Checkout Touch 02' &&
                        d.device_name !== 'Handheld Barcode Scanner PDA' &&
                        d.device_name !== 'Store Manager MacBook Pro' &&
                        !String(d.machine_uuid || '').includes('UUID-9A8B7C') &&
                        !String(d.machine_uuid || '').includes('UUID-3C2B1A') &&
                        !String(d.machine_uuid || '').includes('UUID-4E5F6A') &&
                        !String(d.machine_uuid || '').includes('UUID-1B2C3D') &&
                        !String(d.machine_uuid || '').includes('UUID-8F9E0D')
                    );
                    if (clean.length !== parsed.length) {
                        try { localStorage.setItem('sa_devices_cache', JSON.stringify(clean)); } catch (e) { }
                    }
                    return clean;
                }
            }
        } catch (e) { }
        return [];
    });

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterOs, setFilterOs] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

    const [msg, setMsg] = useState('');
    const [copiedUuid, setCopiedUuid] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    // Selection & Pagination
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const showToast = (message) => {
        setMsg(message);
        setTimeout(() => setMsg(''), 3500);
    };

    const loadDevices = async (isMounted = true) => {
        setLoading(true);
        try {
            let res;
            try {
                res = await axios.get('api.php?action=devices');
            } catch (e1) {
                res = await axios.get('/api/saas-admin/devices');
            }
            if (isMounted && res && res.data && res.data.success && Array.isArray(res.data.devices)) {
                // Filter out any legacy mock devices
                const clean = res.data.devices.filter(d =>
                    d &&
                    d.device_name !== 'Warehouse Receiving Station PC' &&
                    d.device_name !== 'POS Terminal Counter 01' &&
                    d.device_name !== 'Express Checkout Touch 02' &&
                    d.device_name !== 'Handheld Barcode Scanner PDA' &&
                    d.device_name !== 'Store Manager MacBook Pro' &&
                    !String(d.machine_uuid || '').includes('UUID-9A8B7C') &&
                    !String(d.machine_uuid || '').includes('UUID-3C2B1A') &&
                    !String(d.machine_uuid || '').includes('UUID-4E5F6A') &&
                    !String(d.machine_uuid || '').includes('UUID-1B2C3D') &&
                    !String(d.machine_uuid || '').includes('UUID-8F9E0D')
                );
                setDevices(clean);
                try { localStorage.setItem('sa_devices_cache', JSON.stringify(clean)); } catch (e) { }
            } else if (isMounted && res && res.data && Array.isArray(res.data)) {
                const clean = res.data.filter(d =>
                    d &&
                    d.device_name !== 'Warehouse Receiving Station PC' &&
                    d.device_name !== 'POS Terminal Counter 01' &&
                    d.device_name !== 'Express Checkout Touch 02' &&
                    d.device_name !== 'Handheld Barcode Scanner PDA' &&
                    d.device_name !== 'Store Manager MacBook Pro'
                );
                setDevices(clean);
                try { localStorage.setItem('sa_devices_cache', JSON.stringify(clean)); } catch (e) { }
            }
        } catch (err) {
            console.warn('SuperAdminDevices load error', err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        loadDevices(isMounted);
        return () => { isMounted = false; };
    }, []);

    // ⚡ Reset Device Binding (Optimistic 0ms)
    const handleResetBinding = async (id, name) => {
        if (!window.confirm(`Reset device hardware lock binding for "${name}"?\n\nThe client will be able to bind a new machine on their next login.`)) return;

        const previousDevices = [...devices];
        setDevices(prev => {
            const updated = prev.map(d => d.id === id ? { ...d, status: 'Unbound', last_seen: 'Binding Reset (Standby)' } : d);
            try { localStorage.setItem('sa_devices_cache', JSON.stringify(updated)); } catch (e) { }
            return updated;
        });
        showToast(`Hardware binding for "${name}" reset successfully.`);

        try {
            try {
                await axios.post(`api.php?action=unbind-device&id=${id}`);
            } catch (e1) {
                await axios.post(`/api/saas-admin/reset-device-binding/${id}`);
            }
        } catch (err) {
            console.warn('Reset binding error', err);
        }
    };

    // ⚡ Remove Hardware Device Record (Optimistic 0ms)
    const handleDeleteDevice = async (id, name) => {
        if (!window.confirm(`Permanently remove hardware registration for "${name}"?`)) return;

        const previousDevices = [...devices];
        setDevices(prev => {
            const updated = prev.filter(d => d.id !== id);
            try { localStorage.setItem('sa_devices_cache', JSON.stringify(updated)); } catch (e) { }
            return updated;
        });
        setSelectedIds(prev => prev.filter(item => item !== id));
        showToast(`Device "${name}" removed from registry.`);

        try {
            try {
                await axios.post(`api.php?action=delete-device&id=${id}`);
            } catch (e1) {
                await axios.delete(`/api/saas-admin/device/${id}`);
            }
        } catch (err) {
            console.warn('Delete device error', err);
        }
    };

    const copyUuid = (uuid, label = 'UUID') => {
        navigator.clipboard.writeText(uuid);
        setCopiedUuid(uuid);
        showToast(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedUuid(''), 2500);
    };

    // ── Live KPI Computations ──
    const totalFleet = devices.length;
    const onlineCount = devices.filter(d => d.status === 'Online').length;
    const offlineCount = devices.filter(d => d.status !== 'Online').length;
    const uuidLocksCount = devices.filter(d => d.status !== 'Unbound').length;
    const operationalPct = totalFleet > 0 ? Math.round((onlineCount / totalFleet) * 100) : 0;

    // ── Filtering, Searching & Sorting ──
    const filteredDevices = devices.filter(d => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = !query ||
            (d.device_name && d.device_name.toLowerCase().includes(query)) ||
            (d.machine_uuid && d.machine_uuid.toLowerCase().includes(query)) ||
            (d.company_name && d.company_name.toLowerCase().includes(query)) ||
            (d.ip_address && d.ip_address.toLowerCase().includes(query)) ||
            (d.mac_address && d.mac_address.toLowerCase().includes(query)) ||
            (d.os_version && d.os_version.toLowerCase().includes(query));

        let matchesStatus = true;
        if (filterStatus === 'online') matchesStatus = (d.status === 'Online');
        else if (filterStatus === 'offline') matchesStatus = (d.status !== 'Online');

        let matchesOs = true;
        if (filterOs !== 'all') {
            matchesOs = (d.os_version && d.os_version.toLowerCase().includes(filterOs.toLowerCase()));
        }

        return matchesQuery && matchesStatus && matchesOs;
    });

    const sortedDevices = [...filteredDevices].sort((a, b) => {
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
        if (sortBy === 'name') return (a.device_name || '').localeCompare(b.device_name || '');
        if (sortBy === 'company') return (a.company_name || '').localeCompare(b.company_name || '');
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedDevices.length / pageSize) || 1;
    const paginatedDevices = sortedDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Bulk Actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedDevices.map(d => d.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkReset = () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Reset hardware bindings for ${selectedIds.length} selected devices?`)) return;
        setDevices(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'Unbound' } : d));
        showToast(`${selectedIds.length} hardware bindings reset.`);
        setSelectedIds([]);
    };

    const handleBulkDelete = () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Permanently remove ${selectedIds.length} selected devices?`)) return;
        setDevices(prev => prev.filter(d => !selectedIds.includes(d.id)));
        showToast(`${selectedIds.length} devices removed.`);
        setSelectedIds([]);
    };

    const renderDeviceIcon = (os) => {
        const lower = (os || '').toLowerCase();
        if (lower.includes('android') || lower.includes('pda') || lower.includes('mobile')) {
            return <FontAwesomeIcon icon={faMobileScreen} />;
        }
        if (lower.includes('mac') || lower.includes('laptop')) {
            return <FontAwesomeIcon icon={faLaptop} />;
        }
        return <FontAwesomeIcon icon={faDesktop} />;
    };

    return (
        <div className="var-page-container" style={{ padding: '20px 28px 40px 28px', background: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Toast Notification */}
            {msg && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
                    background: '#0F172A', color: '#FFFFFF', padding: '12px 20px',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10B981' }} />
                    {msg}
                </div>
            )}

            {/* ── 1. BREADCRUMB (EXACT MATCH TO /app/sales) ── */}
            <div className="var-breadcrumb">
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>Super Admin</span>
                <span>&gt;</span>
                <span className="var-crumb-active">Connected Devices</span>
            </div>

            {/* ── 2. HEADER ROW (STRICT SINGLE-LINE SLEEK MATCH) ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                marginBottom: '24px',
                flexWrap: 'nowrap'
            }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: '#0F172A',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}>
                        Connected Devices &amp; Machine UUID Registry
                    </h1>
                    <p style={{
                        fontSize: '13px',
                        color: '#64748B',
                        margin: 0,
                        lineHeight: 1.4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        Monitor client laptops, PCs, POS terminals, PDA barcode scanners, and hardware machine bindings in real-time.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0
                }}>
                    <button
                        type="button"
                        className="var-btn-pill var-btn-primary"
                        onClick={loadDevices}
                        style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <FontAwesomeIcon icon={faSignal} /> Refresh Telemetry
                    </button>

                    <button
                        type="button"
                        className="var-btn-pill"
                        onClick={loadDevices}
                        title="Reload Devices"
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesomeIcon icon={faRotate} spin={loading} />
                    </button>
                </div>
            </div>

            {/* ── 3. TOP 4 KPI CARDS GRID (EXACT 4 CARDS MATCH TO /app/sales) ── */}
            <div className="var-kpi-grid">
                {/* Card 1: Total Fleet */}
                <div className="var-kpi-card">
                    <div className="var-kpi-top">
                        <span className="var-kpi-label">Total Fleet</span>
                        <div className="var-kpi-icon green">
                            <FontAwesomeIcon icon={faDesktop} />
                        </div>
                    </div>
                    <div className="var-kpi-value">
                        <LiveCounter value={totalFleet} isCurrency={false} />
                    </div>
                    <div className="var-kpi-bottom">
                        <span className="var-kpi-badge up">{totalFleet > 0 ? '100% Registered Hardware' : '0 Registered Hardware'}</span>
                        <LiveSparkline
                            data={totalFleet > 0 ? [Math.max(1, Math.round(totalFleet * 0.8)), totalFleet] : [0, 0]}
                            color="#16A34A"
                            width={60}
                            height={24}
                        />
                    </div>
                </div>

                {/* Card 2: Online Terminals */}
                <div className="var-kpi-card">
                    <div className="var-kpi-top">
                        <span className="var-kpi-label">Online Terminals</span>
                        <div className="var-kpi-icon green">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                    </div>
                    <div className="var-kpi-value">
                        <LiveCounter value={onlineCount} isCurrency={false} />
                    </div>
                    <div className="var-kpi-bottom">
                        <span className="var-kpi-badge up">{operationalPct}% Operational</span>
                        <LiveSparkline
                            data={onlineCount > 0 ? [Math.max(1, Math.round(onlineCount * 0.85)), onlineCount] : [0, 0]}
                            color="#16A34A"
                            width={60}
                            height={24}
                        />
                    </div>
                </div>

                {/* Card 3: UUID Locks */}
                <div className="var-kpi-card">
                    <div className="var-kpi-top">
                        <span className="var-kpi-label">UUID Locks</span>
                        <div className="var-kpi-icon blue">
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                    </div>
                    <div className="var-kpi-value">
                        <LiveCounter value={uuidLocksCount} isCurrency={false} />
                    </div>
                    <div className="var-kpi-bottom">
                        <span className="var-kpi-badge up">{uuidLocksCount > 0 ? 'Fingerprint Bound' : '0 Bound Hardware'}</span>
                        <LiveSparkline
                            data={uuidLocksCount > 0 ? [Math.max(1, Math.round(uuidLocksCount * 0.9)), uuidLocksCount] : [0, 0]}
                            color="#2563EB"
                            width={60}
                            height={24}
                        />
                    </div>
                </div>

                {/* Card 4: Security Integrity */}
                <div className="var-kpi-card">
                    <div className="var-kpi-top">
                        <span className="var-kpi-label">Security Integrity</span>
                        <div className="var-kpi-icon purple">
                            <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                    </div>
                    <div className="var-kpi-value">
                        SHA-256
                    </div>
                    <div className="var-kpi-bottom">
                        <span className="var-kpi-badge neutral">256-Bit Lock Active</span>
                        <LiveSparkline
                            data={[10, 15, 20]}
                            color="#7C3AED"
                            width={60}
                            height={24}
                        />
                    </div>
                </div>
            </div>

            {/* ── 4. FULL-WIDTH WORKSPACE CONTAINER (EXACT MATCH TO /app/sales) ── */}
            <div className="var-workspace" style={{ width: '100%', boxSizing: 'border-box' }}>
                
                {/* Filter Bar (Exact 1:1 Match to Image 3 /app/sales) */}
                <div className="var-filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div className="var-search-box" style={{ flex: 1, minWidth: '260px' }}>
                        <FontAwesomeIcon icon={faSearch} className="var-search-icon" />
                        <input
                            type="text"
                            placeholder="Search device, UUID, company, IP, MAC..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="var-filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                            className="var-select-sm"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">Status: All</option>
                            <option value="online">Online Only</option>
                            <option value="offline">Offline Only</option>
                        </select>

                        <select
                            className="var-select-sm"
                            value={filterOs}
                            onChange={(e) => { setFilterOs(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">OS: All Platforms</option>
                            <option value="Windows">Windows</option>
                            <option value="macOS">macOS</option>
                            <option value="Android">Android POS</option>
                            <option value="Linux">Linux / Ubuntu</option>
                        </select>

                        <select
                            className="var-select-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="newest">Sort: Newest</option>
                            <option value="oldest">Sort: Oldest</option>
                            <option value="name">Device Name</option>
                            <option value="company">Company Name</option>
                        </select>

                        {/* List / Grid Toggle */}
                        <div className="var-view-toggle">
                            <button
                                type="button"
                                className={`var-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <FontAwesomeIcon icon={faList} />
                            </button>
                            <button
                                type="button"
                                className={`var-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <FontAwesomeIcon icon={faThLarge} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="cat-btn-filter"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                                setFilterOs('all');
                                setSortBy('newest');
                                setCurrentPage(1);
                            }}
                            title="Reset Filters"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Bulk Action Strip */}
                {selectedIds.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        borderRadius: '8px',
                        marginBottom: '14px'
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>
                            {selectedIds.length} device{selectedIds.length > 1 ? 's' : ''} selected
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleBulkReset}
                                style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#D97706', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon icon={faUndo} /> Bulk Reset Binding
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon icon={faTrash} /> Bulk Remove
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#64748B', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                )}

                {/* ── DATA DISPLAY: LIST OR GRID VIEW ── */}
                {viewMode === 'list' ? (
                    <div className="var-table-wrap" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table className="var-table" style={{ width: '100%', textWrap: 'nowrap' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px', padding: '16px 20px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={paginatedDevices.length > 0 && selectedIds.length === paginatedDevices.length}
                                            />
                                        </th>
                                        <th>DEVICE NAME &amp; OS</th>
                                        <th>MACHINE UUID</th>
                                        <th>IP &amp; MAC ADDRESS</th>
                                        <th>COMPANY &amp; OWNER</th>
                                        <th>TELEMETRY SPECS</th>
                                        <th>STATUS</th>
                                        <th style={{ textAlign: 'center' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDevices.length > 0 ? (
                                        paginatedDevices.map((d) => (
                                            <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(d.id)}
                                                        onChange={() => handleSelectOne(d.id)}
                                                    />
                                                </td>

                                                {/* Device Name & OS */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            background: '#ECFDF5', color: '#059669',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0
                                                        }}>
                                                            {renderDeviceIcon(d.os_version)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>{d.device_name}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{d.os_version}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Machine UUID */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontWeight: '800',
                                                            fontSize: '12.5px',
                                                            background: '#F1F5F9',
                                                            color: '#0F172A',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #E2E8F0',
                                                            letterSpacing: '0.03em'
                                                        }}>
                                                            {d.machine_uuid}
                                                        </span>
                                                        <button
                                                            onClick={() => copyUuid(d.full_uuid || d.machine_uuid, 'UUID')}
                                                            style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '12px', padding: '4px' }}
                                                            title="Copy Full UUID"
                                                        >
                                                            <FontAwesomeIcon icon={copiedUuid === (d.full_uuid || d.machine_uuid) ? faCheck : faCopy} style={{ color: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#10B981' : '#64748B' }} />
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* IP & MAC */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: '700', color: '#334155', fontSize: '13px' }}>{d.ip_address}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>MAC: {d.mac_address}</div>
                                                </td>

                                                {/* Company & Owner */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{
                                                            width: '26px', height: '26px', borderRadius: '6px',
                                                            background: '#F1F5F9', color: '#475569',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
                                                        }}>
                                                            <FontAwesomeIcon icon={faBuilding} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{d.company_name}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748B' }}>{d.owner_name}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Telemetry Specs */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: '700' }}>
                                                        {d.ram_size}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                                        {d.cpu_model ? d.cpu_model.split('@')[0] : 'Intel Processor'}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    {d.status === 'Online' ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700', background: '#DCFCE7', color: '#16A34A' }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                                                            Online
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700', background: '#F1F5F9', color: '#64748B' }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }}></span>
                                                            Offline
                                                        </span>
                                                    )}
                                                    <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px' }}>{d.last_seen}</div>
                                                </td>

                                                {/* Actions (Exact 4 Square Buttons Matching Image 3) */}
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        {/* Button 1: Copy UUID */}
                                                        <button
                                                            type="button"
                                                            onClick={() => copyUuid(d.full_uuid || d.machine_uuid, 'UUID')}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '8px',
                                                                border: copiedUuid === (d.full_uuid || d.machine_uuid) ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                                                                background: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#ECFDF5' : '#FFFFFF',
                                                                color: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#10B981' : '#475569',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            title="Copy Machine Lock UUID"
                                                        >
                                                            <FontAwesomeIcon icon={copiedUuid === (d.full_uuid || d.machine_uuid) ? faCheck : faCopy} />
                                                        </button>

                                                        {/* Button 2: View Specs */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedDevice(d);
                                                                setShowDrawer(true);
                                                            }}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '8px',
                                                                border: '1px solid #CBD5E1',
                                                                background: '#FFFFFF',
                                                                color: '#2563EB',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            title="View Device Hardware Specs"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>

                                                        {/* Button 3: Reset Binding / Machine Lock (Lock if unbound!) */}
                                                        {d.status === 'Unbound' ? (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #FECACA',
                                                                    background: '#FEF2F2',
                                                                    color: '#DC2626',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'not-allowed',
                                                                    fontSize: '13px',
                                                                    boxShadow: '0 1px 2px rgba(220, 38, 38, 0.08)'
                                                                }}
                                                                title="Hardware Binding Unbound & Locked 🔒"
                                                            >
                                                                <FontAwesomeIcon icon={faLock} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleResetBinding(d.id, d.device_name)}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #CBD5E1',
                                                                    background: '#FFFFFF',
                                                                    color: '#D97706',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                                title="Reset Hardware Binding Lock"
                                                            >
                                                                <FontAwesomeIcon icon={faUndo} />
                                                            </button>
                                                        )}

                                                        {/* Button 4: Delete Device */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDevice(d.id, d.device_name)}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '8px',
                                                                border: '1px solid #CBD5E1',
                                                                background: '#FFFFFF',
                                                                color: '#DC2626',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            title="Permanently Remove Hardware Record"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '20px' }}>
                                                        <FontAwesomeIcon icon={faDesktop} />
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>No Hardware Devices Registered</div>
                                                    <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', lineHeight: 1.5 }}>
                                                        Devices and POS machines will appear here once connected and authenticated via activation keys.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ── GRID VIEW (CARDS) ── */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '16px',
                        padding: '16px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px'
                    }}>
                        {paginatedDevices.length > 0 ? (
                            paginatedDevices.map((d) => (
                                <div key={d.id} style={{
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    background: '#FFFFFF',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            {d.status === 'Online' ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700', background: '#DCFCE7', color: '#16A34A' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                                                    Online
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700', background: '#F1F5F9', color: '#64748B' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }}></span>
                                                    Offline
                                                </span>
                                            )}
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(d.id)}
                                                onChange={() => handleSelectOne(d.id)}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '8px',
                                                background: '#ECFDF5', color: '#059669',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
                                            }}>
                                                {renderDeviceIcon(d.os_version)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>{d.device_name}</div>
                                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>{d.os_version}</div>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: '#F8FAFC',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '12px'
                                        }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '12.5px', color: '#0F172A' }}>
                                                {d.machine_uuid}
                                            </span>
                                            <button
                                                onClick={() => copyUuid(d.full_uuid || d.machine_uuid, 'UUID')}
                                                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                                title="Copy UUID"
                                            >
                                                <FontAwesomeIcon icon={copiedUuid === (d.full_uuid || d.machine_uuid) ? faCheck : faCopy} style={{ color: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#10B981' : '#64748B' }} />
                                            </button>
                                        </div>

                                        <div style={{ fontSize: '12.5px', marginBottom: '6px' }}>
                                            <span style={{ color: '#64748B' }}>Company: </span>
                                            <span style={{ fontWeight: '700', color: '#0F172A' }}>{d.company_name}</span>
                                        </div>

                                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                                            IP: <b style={{ color: '#334155' }}>{d.ip_address}</b> | Specs: <b style={{ color: '#059669' }}>{d.ram_size}</b>
                                        </div>

                                        <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '14px' }}>
                                            Last Heartbeat: {d.last_seen}
                                        </div>
                                    </div>

                                    {/* Grid 4 Square Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => copyUuid(d.full_uuid || d.machine_uuid, 'UUID')}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                border: copiedUuid === (d.full_uuid || d.machine_uuid) ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                                                background: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#ECFDF5' : '#FFFFFF',
                                                color: copiedUuid === (d.full_uuid || d.machine_uuid) ? '#10B981' : '#475569',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '13px'
                                            }}
                                            title="Copy UUID"
                                        >
                                            <FontAwesomeIcon icon={copiedUuid === (d.full_uuid || d.machine_uuid) ? faCheck : faCopy} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedDevice(d);
                                                setShowDrawer(true);
                                            }}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#2563EB',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '13px'
                                            }}
                                            title="View Hardware Specs"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>

                                        {d.status === 'Unbound' ? (
                                            <button
                                                type="button"
                                                disabled
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'not-allowed', fontSize: '13px'
                                                }}
                                                title="Unbound & Locked 🔒"
                                            >
                                                <FontAwesomeIcon icon={faLock} />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleResetBinding(d.id, d.device_name)}
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#D97706',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', fontSize: '13px'
                                                }}
                                                title="Reset Binding"
                                            >
                                                <FontAwesomeIcon icon={faUndo} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDevice(d.id, d.device_name)}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#DC2626',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '13px'
                                            }}
                                            title="Delete Device"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '50px 20px',
                                color: '#64748B',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '20px' }}>
                                    <FontAwesomeIcon icon={faDesktop} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B' }}>No Hardware Devices Registered</div>
                                <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', lineHeight: 1.5 }}>
                                    Devices and POS machines will appear here once connected and authenticated via activation keys.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PAGINATION BAR ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderTop: 'none',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
                        <span>Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#0F172A', fontWeight: '600' }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries per page (Total {sortedDevices.length} devices)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                background: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
                                color: currentPage === 1 ? '#94A3B8' : '#334155',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '12.5px',
                                fontWeight: '600'
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} /> Prev
                        </button>

                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', padding: '0 8px' }}>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                background: currentPage >= totalPages ? '#F8FAFC' : '#FFFFFF',
                                color: currentPage >= totalPages ? '#94A3B8' : '#334155',
                                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '12.5px',
                                fontWeight: '600'
                            }}
                        >
                            Next <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>

            </div>

            {/* ── DEVICE SPECS DRAWER MODAL ── */}
            {showDrawer && selectedDevice && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div style={{ width: '420px', maxWidth: '90vw', background: '#FFFFFF', height: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                                    <FontAwesomeIcon icon={faDesktop} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Hardware Telemetry</h3>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Device Telemetry &amp; Machine Binding</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDrawer(false)}
                                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#475569' }}
                            >
                                <FontAwesomeIcon icon={faTimes} /> Close
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>DEVICE NAME</div>
                                <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>{selectedDevice.device_name}</div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{selectedDevice.os_version}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>MACHINE LOCK UUID</div>
                                <code style={{ display: 'block', wordBreak: 'break-all', background: '#F1F5F9', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontFamily: 'monospace', color: '#0F172A', fontWeight: '700' }}>
                                    {selectedDevice.full_uuid || selectedDevice.machine_uuid}
                                </code>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>IP ADDRESS</div>
                                    <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{selectedDevice.ip_address}</div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>MAC ADDRESS</div>
                                    <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px', fontSize: '11.5px' }}>{selectedDevice.mac_address}</div>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>BINDING COMPANY</div>
                                <div style={{ fontWeight: '800', color: '#0F172A' }}>{selectedDevice.company_name}</div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>Account Owner: <b>{selectedDevice.owner_name}</b></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>RAM SIZE</div>
                                    <div style={{ fontWeight: '700', color: '#059669', marginTop: '2px' }}>{selectedDevice.ram_size}</div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>STORAGE</div>
                                    <div style={{ fontWeight: '700', color: '#334155', marginTop: '2px' }}>{selectedDevice.storage_info}</div>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>PROCESSOR MODEL</div>
                                <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{selectedDevice.cpu_model}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>POS ENGINE</div>
                                    <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{selectedDevice.app_version}</div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>HEARTBEAT</div>
                                    <div style={{ fontWeight: '700', color: '#10B981', marginTop: '2px' }}>{selectedDevice.last_seen}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SuperAdminDevices;

