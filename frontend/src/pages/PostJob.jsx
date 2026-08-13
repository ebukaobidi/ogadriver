import React from 'react';
import Navbar from '../components/Navbar';
import StatsFooter from '../components/StatsFooter';
import { Link } from 'react-router-dom';

const PostJob = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-8 py-20 w-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">Post a <span className="text-yellow-400">Job</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-8">Ready to find the perfect driver? Log in or create an employer account to post your job listings.</p>
        <Link to="/login" className="px-8 py-4 bg-yellow-400 text-black font-extrabold text-lg rounded-md hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/20">
          Get Started
        </Link>
      </main>
      <StatsFooter />
    </div>
  );
};

export default PostJob;
