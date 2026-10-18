import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const BatchPayoutManager = () => {
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPending = () => {
    setLoading(true);
    api.get('/admin/payouts/pending')
      .then(res => {
        if (res.data.status === 'success') {
          setPendingPayouts(res.data.data);
          setSelectedIds(res.data.data.map(p => p.id));
        }
      })
      .catch(err => console.error('Pending payouts error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setApproving(true);
    setMessage('');
    api.post('/admin/payouts/batch-approve', { payout_ids: selectedIds })
      .then(res => {
        if (res.data.status === 'success') {
          setMessage(res.data.message);
          fetchPending();
        }
      })
      .catch(err => setMessage('Batch payout approval failed.'))
      .finally(() => setApproving(false));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none h-full flex flex-col justify-between transition-colors duration-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-brandMint" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">1-Click Batch Payout Dispatcher</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Approve pending driver earnings</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {pendingPayouts.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              No pending cashouts awaiting approval.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
            {pendingPayouts.map(payout => (
              <div key={payout.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">{payout.user?.name || 'Driver'}</span>
                  <span className="text-slate-500 font-mono text-[11px] block">{payout.bank_name} • {payout.account_number}</span>
                </div>
                <span className="font-mono font-black text-brandMint text-sm">₦{parseFloat(payout.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingPayouts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleBatchApprove}
            disabled={approving}
            className="w-full bg-brandMint text-corporateNavy py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {approving ? 'Processing Transfers...' : `Approve Batch (${selectedIds.length})`}
            {!approving && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchPayoutManager;
