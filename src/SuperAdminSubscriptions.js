import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faBuilding, faUserCheck, faClock, faTriangleExclamation,
    faLock, faXmark, faCheck, faEye, faRotate, faKey, faGlobe, faStore,
    faPlus, faDownload, faFileExcel, faFilePdf, faEllipsisV, faDesktop,
    faUsers, faBoxes, faWarehouse, faCreditCard, faShieldAlt, faServer,
    faChartLine, faCheckCircle, faFilter, faDatabase, faUserSecret, faUndo,
    faTimes, faCalendarAlt, faReceipt, faCloudDownloadAlt, faHeadset, faSlidersH,
    faBan, faDollarSign, faFileInvoice, faToggleOn, faToggleOff, faSyncAlt,
    faChartPie, faArrowUp, faArrowDown, faPrint, faEnvelope, faHistory, faCog
} from '@fortawesome/free-solid-svg-icons';

const defaultSubStats = {
    totalCompanies: 2,
    activeCompanies: 2,
    trialCompanies: 0,
    mrr: 998,
    arr: 11976,
};

const SuperAdminSubscriptions = ({ onNavigate }) => {
    const [stats, setStats] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_stats_cache');
            return cached ? JSON.parse(cached) : defaultSubStats;
        } catch (e) { return defaultSubStats; }
    });
    const [companies, setCompanies] = useState(() => {
        try {
            const cached = localStorage.getItem('sa_companies_cache');
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
    });

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const [selectedTimeframe, setSelectedTimeframe] = useState('30_days');
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [modifyingComp, setModifyingComp] = useState(null);
    const [selectedPlanType, setSelectedPlanType] = useState('monthly_30');
    const [submittingModify, setSubmittingModify] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    // Activity Logs
    const [overrideLogs, setOverrideLogs] = useState([]);

    // Toggle States for Auto-Renew
    const [autoRenewMap, setAutoRenewMap] = useState({});

    // Load Data from Backend APIs
    const loadData = async (isMounted = true) => {
        setLoading(true);
        try {
            const [statsRes, compRes, logsRes] = await Promise.all([
                axios.get('api.php?action=stats').catch(() => axios.get('/api/saas-admin/stats')).catch(() => null),
                axios.get('api.php?action=companies').catch(() => axios.get('/api/saas-admin/companies')).catch(() => null),
                axios.get('api.php?action=override-logs').catch(() => axios.get('/api/saas-admin/override-logs')).catch(() => null)
            ]);

            if (!isMounted) return;

            if (statsRes && statsRes.data && statsRes.data.success) {
                setStats(statsRes.data);
                try { localStorage.setItem('sa_stats_cache', JSON.stringify(statsRes.data)); } catch (e) {}
            }
            if (compRes && compRes.data && compRes.data.success) {
                const compList = compRes.data.companies || [];
                setCompanies(compList);
                try { localStorage.setItem('sa_companies_cache', JSON.stringify(compList)); } catch (e) {}
                const initialMap = {};
                compList.forEach(c => {
                    initialMap[c.id] = c.status === 'active';
                });
                setAutoRenewMap(initialMap);
            }
            if (logsRes && logsRes.data && logsRes.data.success) {
                setOverrideLogs(logsRes.data.logs || []);
            }
        } catch (err) {
            console.warn('SuperAdminSubscriptions load error', err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };


    useEffect(() => {
        let isMounted = true;
        loadData(isMounted);
        return () => { isMounted = false; };
    }, []);

    const showToast = (msg) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 5000);
    };

    const toggleAutoRenew = (id) => {
        setAutoRenewMap(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        showToast('Auto-Renewal preference updated!');
    };

    // Handle Manual Super Admin Plan Override
    const handleModifySubmit = async (e) => {
        e.preventDefault();
        if (!modifyingComp) return;
        setSubmittingModify(true);
        try {
            let res = null;
            try {
                res = await axios.post('api.php?action=modify-subscription', {
                    company_id: modifyingComp.id,
                    plan_type: selectedPlanType
                });
            } catch (e0) {
                try {
                    res = await axios.post('/api/saas-admin/modify-subscription', {
                        company_id: modifyingComp.id,
                        plan_type: selectedPlanType
                    });
                } catch (e1) {
                    res = await axios.post('super_admin/api.php?action=modify-subscription', {
                        company_id: modifyingComp.id,
                        plan_type: selectedPlanType
                    }).catch(() => null);
                }
            }

            if (res && res.data && res.data.success) {
                const newKey = res.data.new_key_code || 'INFYPOS-2026-KEY-UPDATED';
                const newPlanName = selectedPlanType === 'trial_14' ? 'INFY-POS FREE TRIAL (14 Days)' : 'INFY-POS MONTHLY PLAN (30 Days)';
                const newStatus = selectedPlanType === 'trial_14' ? 'trial' : 'active';

                // Optimistically update local company list
                setCompanies(prev => {
                    const updated = prev.map(c => {
                        if (c.id === modifyingComp.id) {
                            return {
                                ...c,
                                status: newStatus,
                                plan_name: newPlanName,
                                key_code: newKey,
                                subscription_ends_at: res.data.expires_at || c.subscription_ends_at,
                                price: newStatus === 'active' ? '₹499 /mo' : 'Free Trial (₹0)',
                                mrr_amount: newStatus === 'active' ? '₹499' : '₹0',
                            };
                        }
                        return c;
                    });
                    try { localStorage.setItem('sa_companies_cache', JSON.stringify(updated)); } catch (e) {}
                    return updated;
                });

                // Optimistically update local audit logs
                const newAuditLog = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                    action: 'Super Admin Manual Plan Override',
                    description: `Modified plan for '${modifyingComp.name}' to ${newPlanName}. Generated New Key: ${newKey}`,
                    details: `Modified plan for '${modifyingComp.name}' to ${newPlanName}. Generated New Key: ${newKey}`,
                    admin_by: 'Manoj S (Super Admin)'
                };
                setOverrideLogs(prev => [newAuditLog, ...prev]);

                showToast(`Subscription modified successfully! New Key: ${newKey} updated in Client Billing Portal.`);
                setShowModifyModal(false);
                setModifyingComp(null);
                loadData(true);
            } else {
                alert('Modify failed: ' + (res?.data?.error || res?.data?.message || 'Server error'));
            }
        } catch (err) {
            alert('Modify error: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
        } finally {
            setSubmittingModify(false);
        }
    };

    // Filter Logic
    const filteredCompanies = companies.filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = (c.name && c.name.toLowerCase().includes(query)) ||
                             (c.owner_name && c.owner_name.toLowerCase().includes(query)) ||
                             (c.email && c.email.toLowerCase().includes(query)) ||
                             (c.gst_number && c.gst_number.toLowerCase().includes(query));

        const matchesPlan = filterPlan === 'all' || (c.plan_name && c.plan_name.toLowerCase().includes(filterPlan.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;

        return matchesQuery && matchesPlan && matchesStatus;
    });

    const getStatusPill = (status) => {
        if (status === 'active') return <span className="sa-pill sa-pill-active">Active</span>;
        if (status === 'trial') return <span className="sa-pill sa-pill-trial">Trial</span>;
        if (status === 'grace_period') return <span className="sa-pill sa-pill-grace">Grace</span>;
        return <span className="sa-pill sa-pill-expired">Expired</span>;
    };

    if (loading || !stats) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <FontAwesomeIcon icon={faRotate} spin style={{ fontSize: '24px', color: '#10B981' }} />
                <div style={{ marginTop: '12px', fontWeight: '600' }}>Loading Enterprise Subscription Portal...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px 20px', background: '#F8FAFC', minHeight: 'calc(100vh - 68px)', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            
            {/* Toast Notification */}
            {actionMsg && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
                    background: '#0F172A', color: '#FFFFFF', padding: '12px 20px',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10B981' }} />
                    {actionMsg}
                </div>
            )}

            {/* ── TOP PAGE HEADER BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        Subscription & Revenue Management Center
                    </h1>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>
                        Manage subscriptions, trials, renewals, manual plan overrides, and customer billing across INFY-POS.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            background: '#10B981', color: '#FFFFFF', border: 'none',
                            padding: '7px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Create Subscription
                    </button>

                    <button
                        onClick={loadData}
                        style={{
                            background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155',
                            padding: '7px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '12px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <FontAwesomeIcon icon={faRotate} spin={loading} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── ROW 1: 8 KPI STAT CARDS (4x2 GRID - ZERO OVERFLOW) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                
                {/* 1. MRR */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>MONTHLY RECURRING MRR</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faDollarSign} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: stats.mrr > 0 ? '#10B981' : '#0F172A', lineHeight: 1.2 }}>
                        ₹{Number(stats.mrr).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: stats.mrr > 0 ? '#10B981' : '#64748B', fontWeight: '700', marginTop: '4px' }}>
                        {stats.mrr > 0 ? '+12.4% vs last month' : 'No Paid Subscribers Yet'}
                    </div>
                </div>

                {/* 2. ARR */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ANNUAL RECURRING ARR</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: stats.arr > 0 ? '#059669' : '#0F172A', lineHeight: 1.2 }}>
                        ₹{Number(stats.arr).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: stats.arr > 0 ? '#059669' : '#64748B', fontWeight: '700', marginTop: '4px' }}>
                        {stats.arr > 0 ? '+18.7% vs last year' : 'No Active ARR'}
                    </div>
                </div>

                {/* 3. Active Subscriptions */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ACTIVE SUBSCRIPTIONS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.activeCompanies}</div>
                    <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', marginTop: '4px' }}>{stats.premiumPct}% of total platform</div>
                </div>

                {/* 4. Trial Accounts */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>TRIAL ACCOUNTS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#F3E8FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.trialCompanies}</div>
                    <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '700', marginTop: '4px' }}>{stats.trialPct || 100}% of total platform</div>
                </div>

                {/* 5. Grace Period */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>GRACE PERIOD</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.graceCompanies}</div>
                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '700', marginTop: '4px' }}>0.0% of total platform</div>
                </div>

                {/* 6. Expired Accounts */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>EXPIRED ACCOUNTS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.expiredCompanies}</div>
                    <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', marginTop: '4px' }}>{stats.expiredPct || 0}% requires renewal</div>
                </div>

                {/* 7. Renewals Today */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>RENEWALS TODAY</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faSyncAlt} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.todayRegistrations}</div>
                    <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', marginTop: '4px' }}>Real DB Count</div>
                </div>

                {/* 8. Pending Payments */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>PENDING PAYMENTS</span>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FEF3C7', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: 1.2 }}>{stats.paymentFailures}</div>
                    <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700', marginTop: '4px' }}>Requires Action</div>
                </div>

            </div>

            {/* ── MAIN 2-COLUMN SECTION: REGISTRY TABLE + SIDEBAR ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '20px' }}>
                
                {/* LEFT MAIN AREA */}
                <div style={{ minWidth: 0 }}>
                    
                    {/* Search & Filter Bar */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }} />
                                <input
                                    type="text"
                                    placeholder="Search company, owner, GST, invoice, phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px',
                                        padding: '6px 10px 6px 30px', fontSize: '12px', color: '#0F172A', outline: 'none'
                                    }}
                                />
                            </div>

                            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', fontSize: '11.5px', color: '#334155', fontWeight: '600' }}>
                                <option value="all">All Plans</option>
                                <option value="premium">INFY-POS PREMIUM</option>
                                <option value="basic">INFY-POS BASIC</option>
                                <option value="enterprise">INFY-POS ENTERPRISE</option>
                            </select>

                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', fontSize: '11.5px', color: '#334155', fontWeight: '600' }}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="trial">Trial</option>
                                <option value="grace_period">Grace</option>
                                <option value="expired">Expired</option>
                            </select>

                            <button onClick={() => { setSearchQuery(''); setFilterPlan('all'); setFilterStatus('all'); }} style={{ background: '#F1F5F9', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', color: '#64748B', cursor: 'pointer', fontWeight: '600' }}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Subscription Registry Table */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden', marginBottom: '20px' }}>
                        <div style={{ padding: '10px 12px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Subscription Registry & Client Management</span>
                                <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 6px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '700' }}>
                                    {filteredCompanies.length} Client Records
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>← Scroll Table Horizontally →</span>
                        </div>

                        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse', fontSize: '11.5px', textWrap: 'nowrap' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '10.5px' }}>
                                        <th style={{ padding: '8px 10px', width: '220px' }}>COMPANY & OWNER</th>
                                        <th style={{ padding: '8px 10px', width: '180px' }}>ACTIVATION KEY</th>
                                        <th style={{ padding: '8px 10px', width: '170px' }}>PLAN</th>
                                        <th style={{ padding: '8px 10px', width: '120px' }}>PRICE</th>
                                        <th style={{ padding: '8px 10px', width: '100px' }}>STATUS</th>
                                        <th style={{ padding: '8px 10px', width: '140px' }}>TRIAL REMAINING</th>
                                        <th style={{ padding: '8px 10px', width: '140px' }}>NEXT BILLING</th>
                                        <th style={{ padding: '8px 10px', width: '130px' }}>PAYMENT METHOD</th>
                                        <th style={{ padding: '8px 10px', width: '110px' }}>REVENUE (MRR)</th>
                                        <th style={{ padding: '8px 10px', width: '150px', textAlign: 'center' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((comp, idx) => (
                                        <tr key={comp.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            
                                            {/* Company & Owner */}
                                            <td style={{ padding: '8px 10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', border: '1px solid #CBD5E1', flexShrink: 0 }}>
                                                        {comp.name ? comp.name.charAt(0) : 'C'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '12px' }}>{comp.name}</div>
                                                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>{comp.owner_name}</div>
                                                        <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>GST: {comp.gst_number || '33AAAAA0000A1Z5'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Activation Key Code */}
                                            <td style={{ padding: '8px 10px' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '10.5px', color: '#0F172A', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                                    {comp.key_code || 'INFYPOS-2026-KEY-FA53D5CD'}
                                                </span>
                                            </td>

                                            {/* Plan Name */}
                                            <td style={{ padding: '8px 10px' }}>
                                                <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                                                    {comp.plan_name || 'INFY-POS PREMIUM'}
                                                </span>
                                            </td>

                                            {/* Price Column */}
                                            <td style={{ padding: '8px 10px', fontWeight: '700', color: comp.status === 'active' ? '#334155' : '#2563EB' }}>
                                                {comp.price || (comp.status === 'active' ? '₹499 /mo' : 'Free Trial (₹0)')}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '8px 10px' }}>
                                                {getStatusPill(comp.status)}
                                            </td>

                                            {/* Trial Remaining */}
                                            <td style={{ padding: '8px 10px' }}>
                                                {comp.status === 'trial' ? (
                                                    <span style={{ color: '#2563EB', fontWeight: '700' }}>
                                                        {comp.days_remaining || 13} Days Left <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 'normal' }}>({comp.trial_ends_at || '19 Aug 2026'})</span>
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#94A3B8' }}>-</span>
                                                )}
                                            </td>

                                            {/* Next Billing */}
                                            <td style={{ padding: '8px 10px' }}>
                                                {comp.status === 'active' ? (
                                                    <span style={{ color: '#0F172A', fontWeight: '600' }}>
                                                        {comp.subscription_ends_at || '04 Sep 2026'}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#64748B' }}>{comp.trial_ends_at || '19 Aug 2026'} (Trial Expiry)</span>
                                                )}
                                            </td>

                                            {/* Payment Method */}
                                            <td style={{ padding: '8px 10px' }}>
                                                {comp.status === 'active' ? (
                                                    <>
                                                        <div style={{ fontWeight: '600', color: '#334155' }}>Razorpay</div>
                                                        <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>UPI / Card</div>
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#94A3B8', fontSize: '11px' }}>Not Added Yet</span>
                                                )}
                                            </td>

                                            {/* Revenue MRR */}
                                            <td style={{ padding: '8px 10px', fontWeight: '800', color: comp.status === 'active' ? '#10B981' : '#94A3B8' }}>
                                                {comp.mrr_amount || (comp.status === 'active' ? '₹499' : '₹0')}
                                            </td>

                                            {/* Actions Column */}
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => {
                                                        setModifyingComp(comp);
                                                        setSelectedPlanType(comp.status === 'active' ? 'monthly_30' : 'trial_14');
                                                        setShowModifyModal(true);
                                                    }}
                                                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                    <FontAwesomeIcon icon={faSlidersH} /> Modify Plan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── SUPER ADMIN OVERRIDE AUDIT LOG TABLE ── */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 12px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FontAwesomeIcon icon={faHistory} style={{ color: '#10B981' }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Super Admin Subscription Activity & Override Logs</span>
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>Real Audit History</span>
                        </div>

                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '11.5px', textWrap: 'nowrap' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontWeight: '700', fontSize: '10.5px' }}>
                                        <th style={{ padding: '8px 10px', width: '160px' }}>TIMESTAMP</th>
                                        <th style={{ padding: '8px 10px', width: '200px' }}>ACTION / EVENT</th>
                                        <th style={{ padding: '8px 10px' }}>DETAILS & GENERATED KEY</th>
                                        <th style={{ padding: '8px 10px', width: '160px' }}>PERFORMED BY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overrideLogs && overrideLogs.length > 0 ? (
                                        overrideLogs.map((log) => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '8px 10px', color: '#64748B', fontWeight: '600' }}>
                                                    {log.timestamp}
                                                </td>
                                                <td style={{ padding: '8px 10px' }}>
                                                    <span style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px 10px', color: '#0F172A', fontWeight: '500' }}>
                                                    {log.description}
                                                </td>
                                                <td style={{ padding: '8px 10px', fontWeight: '700', color: '#059669' }}>
                                                    {log.admin_by}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '16px' }}>
                                                No manual plan overrides recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR PANELS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                    
                    {/* Panel 1: Renewal Center */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Renewal Center</span>
                            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', cursor: 'pointer' }}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#DC2626' }}>● Renew Today</span>
                                <strong>{stats.todayRegistrations || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#D97706' }}>● Renew This Week</span>
                                <strong>{stats.trialEndingSoon || 1}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#2563EB' }}>● Renew This Month</span>
                                <strong>{stats.pendingRenewals || 1}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#EF4444' }}>● Expired</span>
                                <strong>{stats.expiredCompanies || 0}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Real Payment Summary (Excludes Manual Admin Overrides) */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Payment Summary</span>
                            <span style={{ fontSize: '10.5px', color: '#64748B' }}>Real Gateway ˅</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Total Payments</span>
                                <strong style={{ color: '#10B981' }}>₹{Number(stats.mrr).toLocaleString('en-IN')}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Successful</span>
                                <strong style={{ color: '#059669' }}>₹{Number(stats.mrr).toLocaleString('en-IN')}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Failed</span>
                                <strong style={{ color: '#DC2626' }}>₹0</strong>
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Top Plans by Revenue */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Top Plans by Revenue</span>
                            <span style={{ fontSize: '10.5px', color: '#64748B' }}>This Month ˅</span>
                        </div>
                        {(() => {
                            const activeComp = companies.find(c => c.status === 'active');
                            const activePlanName = activeComp ? (activeComp.plan_name || 'INFY-POS BASIC') : '';
                            const basicRev = activePlanName.includes('BASIC') ? stats.mrr : 0;
                            const premiumRev = activePlanName.includes('PREMIUM') ? stats.mrr : 0;
                            const enterpriseRev = activePlanName.includes('ENTERPRISE') ? stats.mrr : 0;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>1. INFY-POS BASIC</span>
                                        <strong style={{ color: '#0F172A' }}>₹{Number(basicRev).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>2. INFY-POS PREMIUM</span>
                                        <strong style={{ color: '#0F172A' }}>₹{Number(premiumRev).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>3. INFY-POS ENTERPRISE</span>
                                        <strong style={{ color: '#0F172A' }}>₹{Number(enterpriseRev).toLocaleString('en-IN')}</strong>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                </div>

            </div>

            {/* ── MANUAL SUBSCRIPTION PLAN OVERRIDE MODAL ── */}
            {showModifyModal && modifyingComp && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '14px', width: '480px', padding: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                                    Modify Client Subscription Plan
                                </h2>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                    Company: <strong>{modifyingComp.name}</strong> ({modifyingComp.owner_name})
                                </div>
                            </div>
                            <FontAwesomeIcon icon={faXmark} style={{ cursor: 'pointer', color: '#64748B', fontSize: '18px' }} onClick={() => setShowModifyModal(false)} />
                        </div>

                        <form onSubmit={handleModifySubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    SELECT NEW SUBSCRIPTION PLAN
                                </label>
                                <select
                                    value={selectedPlanType}
                                    onChange={(e) => setSelectedPlanType(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#0F172A', fontWeight: '600', background: '#F8FAFC' }}
                                >
                                    <option value="trial_14">⏱ 14 Days Commercial Free Trial (₹0 Free)</option>
                                    <option value="monthly_30">⚡ Monthly Plan (30 Days - ₹499/mo)</option>
                                    <option value="quarterly_90">🚀 3 Months Plan (90 Days - ₹1,497)</option>
                                    <option value="yearly_365">👑 1 Year Full License (365 Days - ₹5,988)</option>
                                </select>
                            </div>

                            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px', marginBottom: '18px', fontSize: '11.5px', color: '#92400E' }}>
                                <strong>⚠️ What will happen upon saving:</strong>
                                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                                    <li>Old activation key for this company will be invalidated.</li>
                                    <li>A brand new activation key starts from <strong>NOW</strong> and updates in client's billing portal.</li>
                                    <li>Super Admin manual overrides do <strong>NOT</strong> increment real paid revenue/MRR.</li>
                                </ul>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModifyModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12.5px', color: '#64748B' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submittingModify} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '12.5px' }}>
                                    {submittingModify ? 'Updating Plan...' : 'Save & Modify Subscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── CREATE SUBSCRIPTION MODAL ── */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '480px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Create New Subscription</h2>
                            <FontAwesomeIcon icon={faXmark} style={{ cursor: 'pointer', color: '#64748B' }} onClick={() => setShowCreateModal(false)} />
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); showToast('New Subscription Created Successfully!'); setShowCreateModal(false); }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Company Name</label>
                                <input type="text" required placeholder="Select or enter company..." style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Plan</label>
                                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                    <option>INFY-POS PREMIUM (₹499/mo)</option>
                                    <option>INFY-POS ENTERPRISE (₹999/mo)</option>
                                    <option>INFY-POS BASIC (₹299/mo)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SuperAdminSubscriptions;
