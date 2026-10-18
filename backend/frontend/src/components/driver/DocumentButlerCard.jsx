import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const DocumentButlerCard = () => {
  const [butlerData, setButlerData] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/drivers/documents/butler')
      .then(res => {
        if (res.data.success) setButlerData(res.data.data);
      })
      .catch(err => console.error('Butler error:', err));
  }, []);

  const handleRequestRenewal = (docType) => {
    setRequesting(true);
    setMessage('');
    api.post('/drivers/documents/auto-renew', {
      document_type: docType,
      partner_agency: 'FRSC & LASDRI Partner Portal',
    })
    .then(res => {
      if (res.data.success) {
        setMessage(res.data.message);
      }
    })
    .catch(err => setMessage('Failed to submit renewal request.'))
    .finally(() => setRequesting(false));
  };

  if (!butlerData) return null;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-black text-base text-white">1-Click Auto-Renewal Butler</h3>
          <p className="text-xs text-slate-400">License, LASDRI & Police Clearance renewal support</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
        <div>
          <span className="text-xs font-bold text-white block">Driver’s License Status</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {butlerData.license_expiry ? `Expires: ${butlerData.license_expiry}` : 'Verified Active'}
          </span>
        </div>
        <button
          onClick={() => handleRequestRenewal('driver_license')}
          disabled={requesting}
          className="bg-brandMint text-corporateNavy px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
        >
          {requesting ? 'Submitting...' : 'Request Auto-Renewal'}
        </button>
      </div>
    </div>
  );
};

export default DocumentButlerCard;
