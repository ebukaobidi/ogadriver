import React, { useState, useEffect } from 'react';
import { PhoneCall } from 'lucide-react';
import api from '../../api/axios';

const AiGuarantorCallMonitor = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/ai/guarantor-calls')
      .then(res => {
        if (res.data.status === 'success') setCallLogs(res.data.data);
      })
      .catch(err => console.error('Call logs error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none h-full flex flex-col justify-between transition-colors duration-300">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-teal-500 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">AI Guarantor Call Logs</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Form A & B sponsor auto-audits</p>
          </div>
        </div>

        {callLogs.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              No guarantor call logs recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            {callLogs.slice(0, 4).map(log => (
              <div key={log.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">{log.driver_name}</span>
                  <span className="text-slate-500 font-mono text-[10px] block">Sponsor: {log.guarantor_name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-500/30">
                    {log.confidence_score}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{log.verified_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGuarantorCallMonitor;
