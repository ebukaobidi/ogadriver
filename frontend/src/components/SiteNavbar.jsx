import React, { useState, useEffect } from 'react';
import { Building2, Cpu, Shield, Lock, User, LogOut, Menu, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';

const SiteNavbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    const handleEnterGrid = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setDropdownOpen(false);
        navigate('/');
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
                    <a href="/executive-car-hires" className="transition-colors hover:text-brandMint flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brandMint" /> Car Hire
                    </a>
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
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>{user?.name?.split(' ')[0] || 'User'}</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2">
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
                    ) : (
                        <div className="flex items-center gap-3">
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
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">About Us</a>
                        <a href="#employers" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">For Employers / Drivers</a>
                        <a href="/executive-car-hires" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-brandMint">Car Hire</a>
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
