import React from 'react';
import Navbar from '../components/Navbar';
import StatsFooter from '../components/StatsFooter';

const Jobs = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-8 py-20 w-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">Find <span className="text-yellow-400">Driving Jobs</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl">This page will feature a comprehensive list of available driving jobs in your area. Check back soon for the full job board!</p>
      </main>
      <StatsFooter />
    </div>
  );
};

export default Jobs;
