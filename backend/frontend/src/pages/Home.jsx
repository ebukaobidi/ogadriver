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

      <footer className="bg-slate-950/80 backdrop-blur-md border-t border-slate-800 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Ogadriver.ng Enterprise Grid. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
