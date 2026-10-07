import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/employers', label: 'For Employers' },
    { to: '/resources', label: 'Resources' },
    { to: '/about', label: 'About Us' },
    { to: '/driving-schools', label: 'Driving Schools' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-corporateNavy/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-brandMint to-emerald-500 p-2.5 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
              {/* Steering Wheel Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
                <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                <path d="m12 14-4 4"/>
                <path d="m12 14 4 4"/>
                <path d="M10 12H2"/>
                <path d="M22 12h-8"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide group-hover:text-brandMint transition-colors duration-300">Ogadriver</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wider">YOUR JOURNEY. OUR PRIORITY.</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative py-2 transition-colors duration-300 ${
                  location.pathname === link.to
                    ? 'text-brandMint'
                    : 'text-slate-300 hover:text-brandMint'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandMint rounded-full shadow-lg shadow-emerald-500/50" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-2.5 text-sm font-bold text-brandMint border-2 border-brandMint/30 rounded-xl hover:bg-brandMint/10 hover:border-brandMint transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Log In
            </Link>
            <Link
              to="/post-job"
              className="px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-brandMint to-emerald-500 rounded-xl hover:from-emerald-400 hover:to-brandMint transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
