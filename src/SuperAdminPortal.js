import React, { useState } from 'react';
import SuperAdminLayout from './SuperAdminLayout';
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminCompanies from './SuperAdminCompanies';
import SuperAdminSubscriptions from './SuperAdminSubscriptions';
import SuperAdminKeys from './SuperAdminKeys';
import SuperAdminDevices from './SuperAdminDevices';
import SuperAdminBilling from './SuperAdminBilling';
import SuperAdminInvoices from './SuperAdminInvoices';
import SuperAdminTrials from './SuperAdminTrials';
import SuperAdminAnnouncements from './SuperAdminAnnouncements';
import SuperAdminSupport from './SuperAdminSupport';
import SuperAdminBackups from './SuperAdminBackups';
import SuperAdminReports from './SuperAdminReports';
import SuperAdminSettings from './SuperAdminSettings';
import SuperAdminLogin from './SuperAdminLogin';

/**
 * SuperAdminPortal - Enterprise Owner Control Center Root Component v2.4
 */
const SuperAdminPortal = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('super_admin_authenticated') === 'true';
    });
    const [activeTab, setActiveTab] = useState('dashboard');

    if (!isAuthenticated) {
        return <SuperAdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <SuperAdminDashboard onNavigate={setActiveTab} />;
            case 'companies':
                return <SuperAdminCompanies />;
            case 'revenue':
            case 'subscriptions':
            case 'analytics':
                return <SuperAdminSubscriptions onNavigate={setActiveTab} />;
            case 'keys':
                return <SuperAdminKeys />;
            case 'devices':
                return <SuperAdminDevices />;
            case 'billing':
                return <SuperAdminBilling />;
            case 'invoices':
                return <SuperAdminInvoices />;
            case 'trials':
                return <SuperAdminTrials />;
            case 'announcements':
                return <SuperAdminAnnouncements />;
            case 'support':
                return <SuperAdminSupport />;
            case 'backups':
                return <SuperAdminBackups />;
            case 'reports':
                return <SuperAdminReports />;
            case 'users':
            case 'settings':
            case 'audit':
            case 'health':
                return <SuperAdminSettings />;
            default:
                return <SuperAdminDashboard onNavigate={setActiveTab} />;
        }
    };

    return (
        <SuperAdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </SuperAdminLayout>
    );
};

export default SuperAdminPortal;
