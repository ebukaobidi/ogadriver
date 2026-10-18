import React, { useState, useEffect } from 'react';
import { Building2, Cpu, Shield, Lock, User, LogOut, Menu, X, MapPin, Bell, Award, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import api from '../api/axios';
import LanguageSwitcher from './LanguageSwitcher';

const SiteNavbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = authService.isAuthenticated();
            const userData = authService.getUser();
            setIsAuthenticated(authStatus);
            setUser(userData);
        };

        checkAuth();

        // Listen for storage changes (for multi-tab login/logout)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            if (response.data.status === 'success') {
                setNotifications(response.data.data.notifications || []);
                setUnreadCount(response.data.data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTriggerInstall = () => {
        if (window.__pwaDeferredPrompt) {
            window.__pwaDeferredPrompt.prompt();
            window.__pwaDeferredPrompt.userChoice.then(() => {
                window.__pwaDeferredPrompt = null;
            });
        } else {
            alert("To install OgaDriver on your phone:\n1. Tap your browser menu (the 3 dots ⋮ at the top right)\n2. Select 'Install app' or 'Add to Home screen'\n3. Tap 'Install' — done!");
        }
    };

    const handleEnterGrid = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        setDropdownOpen(false);
        authService.logout();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-corporateNavy/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl h-24 items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <a href="/" className="flex items-center gap-3 group">
                    <svg className="w-12 h-12 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="42" stroke="#1cd188" strokeWidth="7"/>
                        <circle cx="50" cy="38" r="11" fill="white"/>
                        <path d="M26 69 C26 54, 74 54, 74 69" stroke="white" strokeWidth="7" strokeLinecap="round"/>
                        <path d="M38 78 Q50 86 62 78" stroke="#1cd188" strokeWidth="5" strokeLinecap="round"/>
                    </svg>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black tracking-tight text-white font-sans">
                                Oga<span className="text-brandMint">Driver</span>
                            </span>
                            <span className="text-xs font-bold text-white border-2 border-brandMint rounded-md px-1.5 py-0.2 select-none">
                                .ng
                            </span>
                        </div>
                        <span className="text-[8.5px] font-bold text-slate-400 tracking-wider font-mono">
                            SAFE, CERTIFIED DRIVERS FOR YOUR CAR
                        </span>
                    </div>
                </a>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#about" className="transition-colors hover:text-brandMint flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-brandMint" /> About Us
                    </a>
                    <a href="#employers" className="transition-colors hover:text-brandMint">For Employers / Drivers</a>
                    <button onClick={() => navigate('/login')} className="transition-colors hover:text-brandMint flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-brandMint" /> Verify Simulator
                    </button>
                    <a href="#security" className="transition-colors hover:text-brandMint flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-brandMint" /> Security Walls
                    </a>
                    <a href="/driving-schools" className="transition-colors hover:text-brandMint flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-brandMint" /> Driving Schools
                    </a>
                </nav>

                {/* Right CTA */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4 relative">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-lg shadow-lg border border-slate-800 z-50">
                                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                            <h3 className="font-semibold text-white text-sm">Notifications</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="text-xs text-slate-500 p-4 text-center">No notifications</p>
                                            ) : (
                                                notifications.map((notification) => {
                                                    const data = notification.data || {};
                                                    const isUnread = !notification.read_at;
                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer ${
                                                                isUnread ? 'bg-slate-800 font-medium text-white' : 'text-slate-400'
                                                            }`}
                                                        >
                                                            <p className="text-xs">{data.message || data.title}</p>
                                                            <p className="text-[10px] text-slate-600 mt-1">
                                                                {new Date(notification.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>{user?.name?.split(' ')[0] || 'User'}</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-850 rounded-lg shadow-lg border border-slate-700 py-2 z-50">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                navigate('/dashboard');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleTriggerInstall}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brandMint border border-brandMint/40 rounded-lg hover:bg-brandMint/10 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Install App</span>
                            </button>
                            <button
                                onClick={handleEnterGrid}
                                className="relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-brandMint to-emerald-500 px-5 py-3 text-sm font-bold text-corporateNavy shadow-md transition-transform hover:scale-[1.02] active:scale-95"
                            >
                                <span>Sign In</span>
                                <span className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white/20 blur"></span>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-800 bg-corporateNavy/95 backdrop-blur-md">
                    <nav className="px-6 py-4 space-y-4">
                        <button
                            onClick={() => { setMobileMenuOpen(false); handleTriggerInstall(); }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brandMint border border-brandMint/40 rounded-xl bg-brandMint/10"
                        >
                            <Download className="w-4 h-4" />
                            <span>Install OgaDriver App</span>
                        </button>
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">About Us</a>
                        <a href="#employers" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">For Employers / Drivers</a>
                        <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="block w-full text-left text-sm font-medium text-slate-300 hover:text-brandMint">Verify Simulator</button>
                        <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">Security Walls</a>
                        <a href="/driving-schools" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">Driving Schools</a>
                        <div className="pt-4 border-t border-slate-800">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleEnterGrid}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brandMint to-emerald-500 px-5 py-3 text-sm font-bold text-corporateNavy"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default SiteNavbar;
