import React, { useState } from 'react';
import { Globe, Check, X, RotateCcw } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t, detectedAuto } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showAutoNotice, setShowAutoNotice] = useState(true);

  const activeObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative z-50 flex items-center gap-2">
      {/* Auto-detected notification badge if auto-detected and not English */}
      {detectedAuto && showAutoNotice && language !== 'en' && (
        <div className="hidden md:flex items-center gap-2 bg-[#1cd188]/15 border border-[#1cd188]/40 text-[#1cd188] text-xs px-3 py-1 rounded-full shadow-lg animate-fade-in">
          <span>{activeObj.flag} {t('detected_location')}</span>
          <button
            onClick={() => setLanguage('en')}
            className="flex items-center gap-1 font-bold underline hover:text-white transition-colors cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>English</span>
          </button>
          <button
            onClick={() => setShowAutoNotice(false)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Language Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:border-[#1cd188] transition-all cursor-pointer shadow-sm hover:shadow-[#1cd188]/10"
      >
        <Globe className="w-3.5 h-3.5 text-[#1cd188]" />
        <span>{activeObj.flag} {activeObj.label}</span>
      </button>

      {/* Language Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-700/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('language')} / Localization
          </div>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                language === lang.code ? 'bg-[#1cd188]/20 text-[#1cd188]' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.native}</span>
              </span>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-[#1cd188]" />}
            </button>
          ))}
          {language !== 'en' && (
            <div className="p-2 border-t border-slate-700/60 bg-slate-900/40">
              <button
                onClick={() => {
                  setLanguage('en');
                  setOpen(false);
                }}
                className="w-full text-center text-[11px] font-medium text-slate-400 hover:text-emerald-400 py-1 cursor-pointer transition-colors"
              >
                &larr; {t('return_to_english')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
