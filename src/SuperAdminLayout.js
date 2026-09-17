import React, { useState, useEffect, useRef } from 'react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [globalSearch, setGlobalSearch] = useState('');
    const searchInputRef = useRef(null);

    // Ensure document and body scroll naturally in Super Admin
    useEffect(() => {
        document.documentElement.style.height = 'auto';
        document.body.style.height = 'auto';
        const fr = document.querySelector('.flex-root');
        if (fr) fr.style.height = 'auto';
        return () => {
            document.documentElement.style.height = '';
            document.body.style.height = '';
            if (fr) fr.style.height = '';
        };
    }, []);

    // Keyboard shortcuts: Ctrl+B to toggle sidebar, Ctrl+K to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsCollapsed(prev => !prev);
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
        <div className={`sa-root d-flex flex-row flex-column-fluid ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Pure White Sidebar matching Image 2 */}
            <aside className={`sa-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sa-sidebar-header">
                    <div className="sa-logo-wrap">
                        <div className="sa-logo-icon">⚡</div>
                        {!isCollapsed && (
                            <div className="sa-logo-name">
                                INFY-POS <span className="sa-logo-badge">SUPER ADMIN</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="sa-sidebar-toggle-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title="Toggle Sidebar (Ctrl+B)"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>

                {/* Sidebar Search */}
                {!isCollapsed && (
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
                )}

                {/* Sidebar Navigation */}
                <nav className="sa-sidebar-nav">
                    {navSections.map((sec, secIdx) => {
                        const filteredItems = sec.items.filter(item =>
                            item.label.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={secIdx} style={{ marginBottom: '12px' }}>
                                {!isCollapsed && (
                                    <div className="sa-nav-section-title">{sec.title}</div>
                                )}
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`sa-nav-row ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                        title={isCollapsed ? item.label : undefined}
                                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                                    >
                                        <span className="sa-nav-icon-box">
                                            <FontAwesomeIcon icon={item.icon} />
                                        </span>
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Need Help? Box Widget matching Image 2 */}
                {!isCollapsed && (
                    <div className="sa-help-box">
                        <div className="sa-help-row">
                            <div className="sa-help-icon-wrap">
                                <FontAwesomeIcon icon={faLifeRing} />
                            </div>
                            <div className="sa-help-text">
                                <span className="sa-help-title">Need Help?</span>
                                <span className="sa-help-desc">Our support team is ready to help you anytime.</span>
                            </div>
                        </div>
                        <a
                            href="#/super-admin"
                            onClick={(e) => { e.preventDefault(); setActiveTab('support'); }}
                            className="sa-help-btn"
                        >
                            Visit Help Center →
                        </a>
                    </div>
                )}

                {/* Light Sidebar Operational Status Footer */}
                <div style={{
                    padding: isCollapsed ? '12px 6px' : '14px 18px',
                    background: '#FFFFFF',
                    borderTop: '1px solid #EEF2F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#16A34A',
                            display: 'inline-block',
                            boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)'
                        }}></span>
                        {!isCollapsed && (
                            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700' }}>
                                All Systems Operational
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '600' }}>
                            v2.4.0
                        </span>
                    )}
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="sa-main-content d-flex flex-column flex-row-fluid">
                {/* Top Fixed Pure White Navbar matching Image 2 */}
                <header className="sa-top-header">
                    <div className="sa-top-left">
                        {/* Sidebar Toggle when collapsed */}
                        {isCollapsed && (
                            <button
                                type="button"
                                className="sa-hdr-toggle-btn"
                                onClick={() => setIsCollapsed(false)}
                                title="Expand Sidebar (Ctrl+B)"
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                        )}

                        {/* Green POS Button */}
                        <button
                            className="sa-pos-btn"
                            onClick={() => window.location.href = '#/app/pos'}
                            title="Go to POS Terminal"
                        >
                            <FontAwesomeIcon icon={faGrip} />
                            <span>POS</span>
                        </button>

                        {/* Top Global Search Input matching Image 2 */}
                        <div className="sa-top-search">
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94A3B8',
                                    fontSize: '13px'
                                }}
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="sa-top-search-input"
                                placeholder="Search products, invoices, customers, modules.."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                padding: '2px 6px',
                                fontWeight: '700',
                                pointerEvents: 'none'
                            }}>
                                Ctrl + K
                            </span>
                        </div>
                    </div>

                    {/* Right Header Controls matching Image 2 */}
                    <div className="sa-top-actions">
                        <div className="sa-hdr-icon-btn" title="Modules Grid" onClick={() => setActiveTab('settings')}>
                            <FontAwesomeIcon icon={faGrip} />
                        </div>
                        <div className="sa-hdr-icon-btn" title="Announcements & Messages" onClick={() => setActiveTab('announcements')}>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div className="sa-hdr-icon-btn" title="Notifications" onClick={() => setActiveTab('trials')}>
                            <FontAwesomeIcon icon={faBell} />
                            <span className="sa-hdr-badge">12</span>
                        </div>
                        <div className="sa-hdr-icon-btn" title="Toggle Theme">
                            <FontAwesomeIcon icon={faMoon} />
                        </div>
                        <div className="sa-hdr-icon-btn" style={{ width: 'auto', padding: '0 12px', gap: '6px', fontSize: '12.5px', fontWeight: '700' }}>
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
                            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '2px' }} />
                        </div>

                        {/* Sleek Red Logout Button */}
                        <button
                            className="sa-logout-btn"
                            onClick={() => {
                                localStorage.removeItem('super_admin_authenticated');
                                window.location.reload();
                            }}
                            title="Sign out of Super Admin"
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
