import React, { useState, useEffect } from 'react';
import { Wallet, Building2, CheckCircle2, AlertCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const InstantCashoutModal = ({ isOpen, onClose, walletBalance, onCashoutSuccess }) => {
  const [banks, setBanks] = useState([]);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/drivers/payout/banks')
        .then(res => {
          if (res.data.success) setBanks(res.data.data);
        })
        .catch(err => console.error('Could not load banks', err));
    }
  }, [isOpen]);

  const handleBankChange = (e) => {
    const selectedCode = e.target.value;
    const selectedBank = banks.find(b => b.code === selectedCode);
    setFormData(prev => ({
      ...prev,
      bank_code: selectedCode,
      bank_name: selectedBank ? selectedBank.name : '',
    }));
  };

  const handleResolveAccount = () => {
    if (formData.account_number.length === 10 && formData.bank_code) {
      setResolving(true);
      setError('');
      api.post('/drivers/payout/resolve', {
        account_number: formData.account_number,
        bank_code: formData.bank_code,
      })
      .then(res => {
        if (res.data.success) {
          setFormData(prev => ({ ...prev, account_name: res.data.data.account_name }));
        }
      })
      .catch(err => setError('Could not resolve account name.'))
      .finally(() => setResolving(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    api.post('/drivers/payout/request', { ...formData, save_payment_method: savePaymentMethod })
      .then(res => {
        if (res.data.success) {
          setSuccessMsg(res.data.message);
          if (onCashoutSuccess) onCashoutSuccess();
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 2500);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Cashout failed. Please verify details.');
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border border-brandMint/40 rounded-2xl max-w-md w-full p-6 relative shadow-[0_0_50px_rgba(28,209,136,0.15)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brandMint/20 border border-brandMint/40 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-brandMint" />
          </div>
          <div>
            <h3 className="font-black text-xl text-white uppercase tracking-tight">5-Sec Instant Cashout</h3>
            <p className="text-xs text-slate-400 font-mono">24/7 Direct NIBSS/Paystack Bank Transfer</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Amount to Cash Out (₦)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 10000"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold font-mono focus:border-brandMint focus:outline-none"
              required
              min="1000"
            />
            <p className="text-[10px] text-slate-500 mt-1">Available Wallet Balance: <strong className="text-brandMint">₦{walletBalance}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Select Nigerian Bank</label>
            <select
              value={formData.bank_code}
              onChange={handleBankChange}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brandMint focus:outline-none"
              required
            >
              <option value="">Select Bank</option>
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>

                    <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Account Number (10 Digits)</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={e => {
                setFormData({ ...formData, account_number: e.target.value });
                if (e.target.value.length === 10) handleResolveAccount();
              }}
              placeholder="0123456789"
              maxLength={10}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-brandMint focus:outline-none"
              required
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={savePaymentMethod} 
                onChange={e => setSavePaymentMethod(e.target.checked)} 
                className="w-4 h-4 rounded bg-slate-900 border-white/10 text-brandMint focus:ring-brandMint focus:ring-offset-slate-950" 
              />
              <span className="text-xs text-slate-400">Save as default payment method</span>
            </label>
          </div>

          {resolving ? (
            <div className="flex items-center gap-2 text-xs text-brandMint font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving NIBSS account details...
            </div>
          ) : formData.account_name ? (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-mono">Account Name:</span>
              <span className="text-xs text-brandMint font-bold font-mono">{formData.account_name}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !formData.amount || !formData.account_name}
            className="w-full bg-brandMint text-corporateNavy py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing Cashout...' : 'Cash Out Now (5-Sec Instant)'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstantCashoutModal;
