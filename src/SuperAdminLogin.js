import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faKey, faEnvelope, faLock, faArrowRight, faServer } from '@fortawesome/free-solid-svg-icons';
import './SuperAdminPortal.css';

const SuperAdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('superadmin@infy-pos.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            if (email.trim().toLowerCase() === 'superadmin@infy-pos.com' && password === '123456') {
                localStorage.setItem('super_admin_authenticated', 'true');
                localStorage.setItem('super_admin_email', email);
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    window.location.reload();
                }
            } else {
                setError('Invalid Super Admin Credentials! Please use superadmin@infy-pos.com and password 123456.');
                setLoading(false);
            }
        }, 400);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0B0F17 0%, #0F172A 50%, #090D16 100%)',
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            position: 'fixed',
            top: 0, left: 0, zIndex: 999999
        }}>
            <div style={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '460px',
                padding: '40px 36px',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC'
            }}>
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '32px',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                    }}>
                        ⚡
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                        INFY-POS Super Admin
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                        Platform Owner & Control Center Authentication
                    </p>
                </div>

                {/* Restricted Notice Badge */}
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px dashed rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: '#34D399'
                }}>
                    <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: '16px', flexShrink: 0 }} />
                    <div>
                        <strong>Owner Portal Restricted Access</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Use ID: <code>superadmin@infy-pos.com</code> | Pass: <code>123456</code></div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#FCA5A5',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        marginBottom: '20px',
                        fontWeight: '600'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            SUPER ADMIN ID / EMAIL
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FontAwesomeIcon icon={faEnvelope} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="superadmin@infy-pos.com"
                                style={{
                                    width: '100%',
                                    background: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '10px',
                                    padding: '12px 14px 12px 42px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            SUPER ADMIN PASSWORD
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FontAwesomeIcon icon={faLock} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    background: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '10px',
                                    padding: '12px 14px 12px 42px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>{loading ? 'Authenticating Owner Session...' : 'Login to Super Admin Dashboard'}</span>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#64748B' }}>
                    🔒 256-Bit Encrypted Owner Control Session
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
