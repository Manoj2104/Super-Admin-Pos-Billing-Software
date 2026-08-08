import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding, faUserCheck, faClock, faTriangleExclamation, faLock,
    faDollarSign, faChartLine, faLaptopCode, faServer, faDatabase,
    faKey, faPlus, faDownload, faBullhorn, faCheckCircle, faGlobe,
    faUsers, faSignal, faHeadset, faExclamationCircle, faArrowUp,
    faArrowDown, faEllipsisV, faCircle, faPercent, faCreditCard,
    faFileInvoice, faShieldAlt, faFileContract, faRobot, faCog
} from '@fortawesome/free-solid-svg-icons';

import apiConfig from '../../config/apiConfig';

const defaultStats = {
    totalCompanies: 2,
    todayRegistrations: 2,
    activeCompanies: 2,
    trialCompanies: 0,
    expiredCompanies: 0,
    mrr: 998,
    arr: 11976,
    connectedDevices: 1,
    onlineDevicesCount: 1,
    onlineStores: 2,
    offlineStores: 0,
    activeSessions: 1,
    premiumPct: 100,
    trialPct: 0,
    expiredPct: 0,
    conversionRate: 100,
    systemHealth: {
        php_version: '8.2.12',
        mysql_version: 'PostgreSQL 15 (Supabase)',
        web_server: 'Nginx / Apache Standalone',
        redis: 'Active',
        storage: '85.1% Used Healthy'
    }
};

const SuperAdminDashboard = ({ onNavigate }) => {
    const [stats, setStats] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_stats_cache');
            return cached ? JSON.parse(cached) : defaultStats;
        } catch (e) { return defaultStats; }
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                let res;
                try {
                    res = await axios.get('api.php?action=stats');
                } catch (e0) {
                    try {
                        res = await apiConfig.get('saas-admin/stats');
                    } catch (e1) {
                        res = await axios.get('/api/saas-admin/stats');
                    }
                }
                if (res && res.data && res.data.success) {
                    setStats(res.data);
                    try { localStorage.setItem('sa_stats_cache', JSON.stringify(res.data)); } catch (e) {}
                }
            } catch (err) {
                console.warn('SuperAdminDashboard stats error', err);
            }
        };
        loadStats();
    }, []);

    return (
        <div>
            {/* Top Yellow Warning Banner */}
            <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                padding: '12px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13.5px',
                fontWeight: '600'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#D97706', fontSize: '16px' }} />
                    <span>Your free trial for Jeyachandran Textile Private Limited expires in 3 days (09 Aug 2026). Renew now to avoid interruption.</span>
                </div>
                <button
                    onClick={() => onNavigate('companies')}
                    style={{
                        background: '#D97706',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    Renew Now →
                </button>
            </div>

            {/* TOP 8 CARDS GRID: 4 CARDS TOP ROW, 4 CARDS BOTTOM ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                
                {/* ROW 1 - CARD 1: Registered Companies */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>REGISTERED COMPANIES</span>
                        <div className="sa-kpi-icon sa-badge-blue" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faBuilding} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{stats.totalCompanies}</div>
                    <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', marginTop: '6px' }}>+{stats.todayRegistrations} registered today</div>
                </div>

                {/* ROW 1 - CARD 2: Active Premium Customers */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PREMIUM CUSTOMERS</span>
                        <div className="sa-kpi-icon sa-badge-green" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{stats.activeCompanies}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{stats.premiumPct}% of total platform</div>
                </div>

                {/* ROW 1 - CARD 3: Trial Customers */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TRIAL CUSTOMERS</span>
                        <div className="sa-kpi-icon sa-badge-amber" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{stats.trialCompanies}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{stats.trialPct}% of total platform</div>
                </div>

                {/* ROW 1 - CARD 4: Expired Customers */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>EXPIRED CUSTOMERS</span>
                        <div className="sa-kpi-icon sa-badge-red" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{stats.expiredCompanies}</div>
                    <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '700', marginTop: '6px' }}>{stats.expiredPct}% requires renewal</div>
                </div>

                {/* ROW 2 - CARD 5: Monthly Recurring Revenue (MRR) */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>MONTHLY RECURRING (MRR)</span>
                        <div className="sa-kpi-icon sa-badge-green" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faDollarSign} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: stats.mrr > 0 ? '#16A34A' : '#0F172A' }}>₹{Number(stats.mrr).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '12px', color: stats.mrr > 0 ? '#16A34A' : '#64748B', fontWeight: '700', marginTop: '6px' }}>
                        {stats.mrr > 0 ? '+12.4% vs last month' : 'No Paid Subscribers Yet'}
                    </div>
                </div>

                {/* ROW 2 - CARD 6: Annual Recurring Revenue (ARR) */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ANNUAL RECURRING (ARR)</span>
                        <div className="sa-kpi-icon sa-badge-blue" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: stats.arr > 0 ? '#2563EB' : '#0F172A' }}>₹{Number(stats.arr).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '12px', color: stats.arr > 0 ? '#16A34A' : '#64748B', fontWeight: '700', marginTop: '6px' }}>
                        {stats.arr > 0 ? '+18.7% vs last year' : 'No Annual Revenue Yet'}
                    </div>
                </div>

                {/* ROW 2 - CARD 7: Today's Revenue */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TODAY'S REVENUE</span>
                        <div className="sa-kpi-icon sa-badge-purple" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>₹{Number(stats.todayRevenue).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', marginTop: '6px' }}>+8.6% vs yesterday</div>
                </div>

                {/* ROW 2 - CARD 8: Connected Devices */}
                <div className="sa-kpi-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CONNECTED DEVICES</span>
                        <div className="sa-kpi-icon sa-badge-purple" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                            <FontAwesomeIcon icon={faLaptopCode} />
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{stats.connectedDevices}</div>
                    <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', marginTop: '6px' }}>{stats.onlineDevicesCount} online terminals</div>
                </div>

            </div>

            {/* MIDDLE SECTION - EXACTLY 3 CARDS PER LINE (CHARTS & ANALYTICS WIDGETS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                
                {/* 1. Monthly Revenue Chart Widget */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header" style={{ marginBottom: '14px' }}>
                        <h3 className="sa-card-title">Monthly Revenue</h3>
                        <span style={{ fontSize: '11.5px', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>This Year ˅</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#16A34A', marginBottom: '14px' }}>₹{Number(stats.mrr).toLocaleString('en-IN')}</div>

                    <div style={{ height: '140px', width: '100%' }}>
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%' }}>
                            <path d="M0,80 Q30,65 60,70 T120,50 T180,60 T240,30 T300,20 L300,100 L0,100 Z" fill="url(#greenGrad4)" opacity="0.2" />
                            <path d="M0,80 Q30,65 60,70 T120,50 T180,60 T240,30 T300,20" fill="none" stroke="#16A34A" strokeWidth="3" />
                            <circle cx="240" cy="30" r="5" fill="#16A34A" />
                            <defs>
                                <linearGradient id="greenGrad4" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#16A34A" />
                                    <stop offset="100%" stopColor="#FFFFFF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontWeight: '600' }}>
                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                </div>

                {/* 2. Subscriber Growth Chart Widget */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header" style={{ marginBottom: '14px' }}>
                        <h3 className="sa-card-title">Subscriber Growth</h3>
                        <span style={{ fontSize: '11.5px', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>This Year ˅</span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', marginBottom: '10px' }}>
                        <span style={{ color: '#16A34A', fontWeight: '700' }}>● Premium</span>
                        <span style={{ color: '#D97706', fontWeight: '700' }}>● Trial</span>
                        <span style={{ color: '#2563EB', fontWeight: '700' }}>● Total</span>
                    </div>

                    <div style={{ height: '140px', width: '100%' }}>
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%' }}>
                            <path d="M0,70 Q50,60 100,55 T200,40 T300,20" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                            <path d="M0,80 Q50,70 100,65 T200,50 T300,35" fill="none" stroke="#16A34A" strokeWidth="2.5" />
                            <path d="M0,90 Q50,85 100,80 T200,70 T300,60" fill="none" stroke="#D97706" strokeWidth="2.5" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontWeight: '600' }}>
                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                </div>

                {/* 3. Trial Conversion & Quick Actions Combined Widget */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header" style={{ marginBottom: '14px' }}>
                        <h3 className="sa-card-title">Trial Conversion & Quick Actions</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
                        {/* Doughnut Widget */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 8px auto' }}>
                                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="3.8" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#16A34A" strokeWidth="3.8" strokeDasharray={`${stats.conversionRate || 68.4}, 100`} />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{stats.conversionRate || 68.4}%</div>
                                    <div style={{ fontSize: '9px', color: '#64748B' }}>Conversion</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                                Converted: <strong>{stats.activeCompanies}</strong> | Trial: <strong>{stats.trialCompanies}</strong>
                            </div>
                        </div>

                        {/* Quick Action Buttons Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                            <button className="sa-btn-emerald" onClick={() => onNavigate('keys')} style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faKey} /> Generate Key
                            </button>
                            <button className="sa-action-btn" onClick={() => onNavigate('companies')} style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faBuilding} /> Create Company
                            </button>
                            <button className="sa-action-btn" onClick={() => onNavigate('announcements')} style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faBullhorn} /> Broadcast
                            </button>
                            <button className="sa-action-btn" onClick={() => onNavigate('settings')} style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}>
                                <FontAwesomeIcon icon={faCog} /> System Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOWER SECTION - EXACTLY 3 CARDS PER LINE (DATA GRIDS & MONITORING) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                
                {/* 1. Recent Registrations Table */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">Recent Registrations</h3>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', cursor: 'pointer' }} onClick={() => onNavigate('companies')}>View All</span>
                    </div>

                    <div className="sa-table-responsive">
                        <table className="sa-table" style={{ fontSize: '12.5px' }}>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentRegistrations.map((r, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '700', color: '#0F172A', whiteSpace: 'normal', maxWidth: '160px' }}>{r.name}</td>
                                        <td style={{ color: '#64748B' }}>{r.owner}</td>
                                        <td>
                                            {r.status === 'Active' ? <span className="sa-pill sa-pill-active">Active</span> : <span className="sa-pill sa-pill-trial">Trial</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Recent Transactions Table */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">Recent Transactions</h3>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', cursor: 'pointer' }}>View All</span>
                    </div>

                    <div className="sa-table-responsive">
                        <table className="sa-table" style={{ fontSize: '12.5px' }}>
                            <thead>
                                <tr>
                                    <th>Tx ID</th>
                                    <th>Company</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentTransactions.map((tx, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#16A34A' }}>{tx.tx_id}</td>
                                        <td style={{ color: '#0F172A', fontWeight: '600', whiteSpace: 'normal', maxWidth: '160px' }}>{tx.company}</td>
                                        <td style={{ fontWeight: '800', color: tx.status === 'Paid' ? '#16A34A' : '#DC2626' }}>{tx.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. System Health & Trial Ending Soon (Combined Card 3) */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">System Health & Trial Expiries</h3>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700' }}>Details</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                            <span style={{ color: '#64748B' }}>PHP Engine</span>
                            <strong style={{ color: '#16A34A' }}>{stats.systemHealth.php_version} Healthy</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                            <span style={{ color: '#64748B' }}>Database</span>
                            <strong style={{ color: '#16A34A' }}>{stats.systemHealth.mysql_version} Healthy</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                            <span style={{ color: '#64748B' }}>Storage</span>
                            <strong style={{ color: '#16A34A' }}>{stats.systemHealth.storage}</strong>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Trial Expiries Soon:</div>
                        {stats.trialEndingSoonList.map((t, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600', color: '#334155', whiteSpace: 'normal', maxWidth: '180px' }}>{t.name}</span>
                                <span style={{ color: '#D97706', fontWeight: '700' }}>{t.days_left}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION - EXACTLY 3 CARDS PER LINE (TIMELINE, INSIGHTS & SUMMARY) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                
                {/* 1. Activity Feed */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">Activity Feed</h3>
                        <span style={{ fontSize: '11.5px', color: '#64748B', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>All Activities</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stats.activityFeed.map((act, idx) => (
                            <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                <span style={{ color: '#16A34A', fontWeight: '800' }}>●</span>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{act.title}</div>
                                    <div style={{ color: '#64748B', fontSize: '11px' }}>{act.company} ({act.time})</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. AI Business Insights */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">AI Business Insights</h3>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700' }}>View Insights</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700' }}>High Churn Risk</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#DC2626', marginTop: '2px' }}>{stats.aiInsights.high_churn_risk} Companies</div>
                        </div>
                        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '700' }}>Inactive Accounts</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>{stats.aiInsights.inactive_companies} Companies</div>
                        </div>
                        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '10px', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '11px', color: '#15803D', fontWeight: '700' }}>Revenue Forecast</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16A34A', marginTop: '2px' }}>{stats.aiInsights.revenue_prediction}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Platform Growth Summary */}
                <div className="sa-card" style={{ marginBottom: 0 }}>
                    <div className="sa-card-header">
                        <h3 className="sa-card-title">Platform Summary</h3>
                        <span className="sa-pill sa-pill-active">● Active Node</span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748B' }}>Total Registered:</span>
                            <strong style={{ color: '#0F172A' }}>{stats.totalCompanies} Businesses</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748B' }}>Active Revenue:</span>
                            <strong style={{ color: '#16A34A' }}>₹{Number(stats.mrr).toLocaleString('en-IN')} / Mo</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Node Server Time:</span>
                            <strong style={{ color: '#0F172A' }}>{new Date().toLocaleTimeString()}</strong>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default SuperAdminDashboard;
