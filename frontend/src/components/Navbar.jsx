import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0a0b10]">
      <div className="flex items-center space-x-3">
        <div className="bg-yellow-400 p-2 rounded-full flex items-center justify-center">
          {/* Steering Wheel Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Ogadriver</h1>
          <p className="text-xs text-gray-400">Your Journey. Our Priority.</p>
        </div>
      </div>

      <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
        <Link to="/jobs" className="hover:text-yellow-400 transition">Find Jobs</Link>
        <Link to="/employers" className="hover:text-yellow-400 transition">For Employers</Link>
        <Link to="/resources" className="hover:text-yellow-400 transition">Resources</Link>
        <Link to="/about" className="hover:text-yellow-400 transition">About Us</Link>
        <Link to="/driving-schools" className="hover:text-yellow-400 transition">Driving Schools</Link>
        <Link to="/executive-car-hires" className="hover:text-yellow-400 transition">Car Hire</Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/login" className="px-6 py-2 text-sm font-medium text-yellow-400 border border-yellow-400 rounded-md hover:bg-yellow-400 hover:text-black transition">
          Log In
        </Link>
        <Link to="/post-job" className="px-6 py-2 text-sm font-medium text-black bg-yellow-400 rounded-md hover:bg-yellow-500 transition">
          Post a Job
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
