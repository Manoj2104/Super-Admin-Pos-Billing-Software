import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine, faBuilding, faKey, faLaptopCode, faCog,
    faBell, faShieldAlt, faServer, faSignOutAlt, faBolt,
    faUserCheck, faDotCircle, faRotate, faDollarSign, faHeadset,
    faBullhorn, faDatabase, faUsers, faLayerGroup, faBars,
    faSearch, faGrip, faEnvelope, faMoon, faGlobe, faChevronDown,
    faCreditCard, faFileInvoice, faReceipt, faClock, faLifeRing,
    faCloudDownload, faFileAlt, faUserLock, faHistory
} from '@fortawesome/free-solid-svg-icons';
import './SuperAdminPortal.css';

const SuperAdminLayout = ({ activeTab, setActiveTab, children }) => {
    const [serverTime, setServerTime] = useState(new Date().toLocaleTimeString());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setServerTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const navSections = [
        {
            title: 'MAIN',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: faChartLine },
                { id: 'companies', label: 'Companies', icon: faBuilding },
                { id: 'revenue', label: 'Subscriptions', icon: faDollarSign },
                { id: 'keys', label: 'Activation Keys', icon: faKey },
                { id: 'devices', label: 'Connected Devices', icon: faLaptopCode },
                { id: 'billing', label: 'Billing & Payments', icon: faCreditCard },
                { id: 'invoices', label: 'Invoices', icon: faFileInvoice },
                { id: 'analytics', label: 'Revenue & Analytics', icon: faChartLine },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { id: 'trials', label: 'Trial Management', icon: faClock },
                { id: 'announcements', label: 'Broadcast & Announcements', icon: faBullhorn },
                { id: 'support', label: 'Support Tickets', icon: faLifeRing },
                { id: 'backups', label: 'Backup & Restore', icon: faCloudDownload },
                { id: 'reports', label: 'Reports', icon: faFileAlt },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { id: 'users', label: 'Users & Roles', icon: faUserLock },
                { id: 'settings', label: 'Settings', icon: faCog },
                { id: 'audit', label: 'Audit Logs', icon: faHistory },
                { id: 'health', label: 'System Health', icon: faServer },
            ]
        }
    ];

    return (
        <div className="sa-root">
            {/* White Sidebar matching Image 2 */}
            <aside className="sa-sidebar">
                <div className="sa-sidebar-header">
                    <div className="sa-logo-wrap">
                        <div className="sa-logo-icon">⚡</div>
                        <div className="sa-logo-name">
                            INFY-POS <span className="sa-logo-badge">SUPER ADMIN</span>
                        </div>
                    </div>
                    <FontAwesomeIcon icon={faBars} style={{ color: '#64748B', cursor: 'pointer', fontSize: '16px' }} />
                </div>

                {/* Sidebar Search */}
                <div className="sa-sidebar-search-wrap">
                    <div className="sa-sidebar-search">
                        <FontAwesomeIcon icon={faSearch} style={{ color: '#94A3B8', fontSize: '13px' }} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="sa-sidebar-nav">
                    {navSections.map((sec, secIdx) => {
                        const filteredItems = sec.items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={secIdx}>
                                <div className="sa-nav-section-title">{sec.title}</div>
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`sa-nav-row ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                    >
                                        <span className="sa-nav-icon-box">
                                            <FontAwesomeIcon icon={item.icon} />
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Clean Light Sidebar Footer matching Image 2 */}
                <div style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', color: '#0F172A' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>SYSTEM STATUS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16A34A', fontWeight: '700', marginBottom: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
                        <span>All Systems Operational</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>v2.4.0 Super Admin Portal</div>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="sa-main-content">
                {/* Top Header */}
                <header className="sa-top-header">
                    <div className="sa-top-left">
                        {/* Green POS Button */}
                        <button className="sa-pos-btn">
                            <FontAwesomeIcon icon={faGrip} />
                            <span>POS</span>
                        </button>

                        {/* Top Global Search Input matching Image 2 */}
                        <div className="sa-top-search">
                            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' }} />
                            <input
                                type="text"
                                className="sa-top-search-input"
                                placeholder="Search by company, owner, email, phone, GST, invoice, activation key... (Ctrl + K)"
                            />
                        </div>
                    </div>

                    {/* Right Header Controls matching Image 2 */}
                    <div className="sa-top-actions">
                        <div className="sa-hdr-icon-btn" title="Modules Grid">
                            <FontAwesomeIcon icon={faGrip} />
                        </div>
                        <div className="sa-hdr-icon-btn" title="Messages">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div className="sa-hdr-icon-btn" title="Notifications">
                            <FontAwesomeIcon icon={faBell} />
                            <span className="sa-hdr-badge">12</span>
                        </div>
                        <div className="sa-hdr-icon-btn" title="Theme Toggle">
                            <FontAwesomeIcon icon={faMoon} />
                        </div>
                        <div className="sa-hdr-icon-btn" style={{ width: 'auto', padding: '0 10px', gap: '6px', fontSize: '12.5px', fontWeight: '700' }}>
                            <FontAwesomeIcon icon={faGlobe} />
                            <span>EN</span>
                            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '10px' }} />
                        </div>

                        {/* User Avatar Badge matching Image 2 */}
                        <div className="sa-user-profile">
                            <div className="sa-user-avatar-circle">MS</div>
                            <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', lineHeight: 1.1 }}>Manoj S</div>
                                <div style={{ fontSize: '10.5px', color: '#64748B' }}>Super Admin</div>
                            </div>
                            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '4px' }} />
                        </div>

                        {/* Red Logout Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem('super_admin_authenticated');
                                window.location.reload();
                            }}
                            style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginLeft: '6px'
                            }}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Body Content */}
                <div className="sa-body-container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
