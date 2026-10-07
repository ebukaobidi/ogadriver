import React, { useState, useEffect } from 'react';
import { MessageCircle, PhoneCall, HeadphonesIcon, X } from 'lucide-react';
import api from '../api/axios';

const CustomerSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    tawktoPropertyId: null,
    customerCareNumber: '',
    whatsappNumber: '',
    whatsappMessage: 'Hello OgaDriver Support! I need some assistance.'
  });

  useEffect(() => {
    api.get('/settings/public')
      .then(res => {
        if (res.data.status === 'success') {
          setSettings({
            tawktoPropertyId: res.data.data.tawktoPropertyId,
            customerCareNumber: res.data.data.customerCareNumber,
            whatsappNumber: res.data.data.whatsappNumber,
            whatsappMessage: res.data.data.whatsappMessage
          });
        }
      })
      .catch(console.error);
  }, []);

  const cleanNumber = (settings.whatsappNumber || settings.customerCareNumber || '').replace(/[^0-9]/g, '');
  const voiceNumber = (settings.customerCareNumber || '').replace(/[^0-9+]/g, '');

  useEffect(() => {
    if (!settings.tawktoPropertyId) return;
    
    // Tawk.to Live Chat Injection
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    (function () {
      let s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = `https://embed.tawk.to/${settings.tawktoPropertyId}/default`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    })();

    // Hide the default Tawk.to bubble so we only use our custom OgaDriver button
    window.Tawk_API.onLoad = function () {
      window.Tawk_API.hideWidget();
    };
  }, [settings.tawktoPropertyId]);

  const handleLiveChatClick = () => {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      alert("Live chat is still connecting. Please try again in a few seconds.");
    }
    setIsOpen(false);
  };

  const handleCallClick = () => {
    window.open(`tel:${voiceNumber}`, '_self');
    setIsOpen(false);
  };

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(settings.whatsappMessage);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex flex-col items-end gap-3">
      
      {/* Expanded Menu */}
      <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom right-0 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none absolute bottom-16'}`}>
        
        {/* Voice Call Option */}
        <button 
          onClick={handleCallClick}
          className="group flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-full px-4 py-3 shadow-xl transition-all"
        >
          <span className="text-sm font-bold text-white whitespace-nowrap">Voice Call</span>
          <div className="bg-blue-500 text-white rounded-full p-2">
            <PhoneCall size={18} />
          </div>
        </button>

        {/* WhatsApp Option */}
        <button 
          onClick={handleWhatsAppClick}
          className="group flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 rounded-full px-4 py-3 shadow-xl transition-all"
        >
          <span className="text-sm font-bold text-white whitespace-nowrap">WhatsApp Support</span>
          <div className="bg-emerald-500 text-white rounded-full p-2">
            <MessageCircle size={18} />
          </div>
        </button>

        {/* Live Chat Option */}
        {settings.tawktoPropertyId && (
          <button 
            onClick={handleLiveChatClick}
            className="group flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-brandMint hover:bg-slate-800 rounded-full px-4 py-3 shadow-xl transition-all"
          >
            <span className="text-sm font-bold text-white whitespace-nowrap">Live Chat (App)</span>
            <div className="bg-brandMint text-corporateNavy rounded-full p-2">
              <HeadphonesIcon size={18} />
            </div>
          </button>
        )}
      </div>

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-110 relative border-2 border-white/10 ${isOpen ? 'bg-slate-800 text-slate-300 hover:text-white shadow-lg' : 'bg-brandMint hover:bg-emerald-400 text-corporateNavy shadow-[0_4px_20px_rgba(28,209,136,0.4)]'}`}
      >
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none">
            Live Support
          </span>
        )}
        
        {isOpen ? (
          <X size={26} className="animate-fade-in" />
        ) : (
          <HeadphonesIcon size={26} className="animate-pulse-slow" />
        )}
      </button>

    </div>
  );
};

export default CustomerSupport;
