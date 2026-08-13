import React from 'react';
import Navbar from '../components/Navbar';
import StatsFooter from '../components/StatsFooter';

const Resources = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-8 py-20 w-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">Helpful <span className="text-yellow-400">Resources</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl">Guides, FAQs, and tips for both drivers and employers to get the most out of Ogadriver.</p>
      </main>
      <StatsFooter />
    </div>
  );
};

export default Resources;
