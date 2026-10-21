import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


import SiteNavbar from '../components/SiteNavbar';
import HeroSection from '../components/HeroSection';
import AppEcosystemSection from '../components/AppEcosystemSection';
import AboutSection from '../components/AboutSection';
import EmployersGate from '../components/EmployersGate';
import SecurityArchitecture from '../components/SecurityArchitecture';

const Home = () => {
  
const [content, setContent] = useState(null);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    // Fetch site content from our backend API
    api.get('/site-content')
      .then(response => {
        setContent(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load site content', error);
        setLoading(false);
      });
  }, []);


if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-corporateNavy text-white">
        Loading site content...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1e1b4b] text-white font-sans overflow-x-hidden selection:bg-brandMint selection:text-corporateNavy">
      <SiteNavbar />
      <HeroSection content={content} />
      <AppEcosystemSection />
      <AboutSection content={content} />
      <EmployersGate content={content} />
      <SecurityArchitecture content={content} />

      <footer className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800/60 text-left">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-black text-white tracking-tight">OGA<span className="text-brandMint">DRIVER</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                OgaDriver is an enterprise mobility and driver-matching technology platform connecting verified, vetted professional drivers with private car owners, corporate fleets, and executive transport needs across Nigeria.
              </p>
              <div className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                A Product of Cejmart Island Int'l Ltd
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Corporate Headquarters</h4>
              <p className="text-xs text-slate-200 leading-relaxed mb-1 font-semibold">
                Cejmart Island Int'l Ltd
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                No. 14, Dutsen Street, Gbazango Extension, Kubwa, Abuja-FCT, Nigeria.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-500 font-semibold">Direct Telephone:</span> +234 805 404 4980 / +234 812 729 0420</p>
                <p><span className="text-slate-500 font-semibold">Official Email:</span> support@ogadriver.ng / info@ogadriver.ng</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Corporate & Legal</h4>
              <ul className="text-xs space-y-2">
                <li><a href="/terms" className="hover:text-brandMint transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-brandMint transition-colors">Privacy Policy</a></li>
                <li><a href="/about" className="hover:text-brandMint transition-colors">About Cejmart Island & OgaDriver</a></li>
                <li className="text-slate-500 pt-1">Incorporated under the Corporate Affairs Commission (CAC) of the Federal Republic of Nigeria.</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              &copy; {new Date().getFullYear()} OgaDriver.ng. OgaDriver is a product of Cejmart Island Int'l Ltd. All rights reserved.
            </p>
            <p className="text-slate-600">
              Authorized Nigerian Commercial & Executive Mobility Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
