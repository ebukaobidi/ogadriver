import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

import SiteNavbar from '../components/SiteNavbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import EmployersGate from '../components/EmployersGate';
import SecurityArchitecture from '../components/SecurityArchitecture';

const Home = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch site content from our backend API
    axios.get('http://127.0.0.1:8000/api/site-content')
      .then(response => {
        setContent(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load site content', error);
        setLoading(false);
      });
  }, []);


  return (
    <div className="min-h-screen bg-corporateNavy text-white font-sans overflow-x-hidden selection:bg-brandMint selection:text-corporateNavy">
      <SiteNavbar />
      <HeroSection content={content} />
      <AboutSection content={content} />
      <EmployersGate content={content} />
      <SecurityArchitecture content={content} />
      
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center">
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
