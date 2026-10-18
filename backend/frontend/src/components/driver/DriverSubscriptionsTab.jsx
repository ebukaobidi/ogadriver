import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle2, RefreshCw, AlertCircle, Shield, Zap } from 'lucide-react';
import api from '../../api/axios';
import { safeArray } from '../../utils/safeArray';

const getCurrencySymbol = (country, currencyCode) => {
  const c = (country || '').toLowerCase();
  const curr = (currencyCode || '').toUpperCase();

  if (curr === 'NGN' || c.includes('nigeria') || c === 'ng') return '₦';
  if (curr === 'GHS' || c.includes('ghana') || c === 'gh') return 'GH₵';
  if (curr === 'KES' || c.includes('kenya') || c === 'ke') return 'KSh';
  if (curr === 'ZAR' || c.includes('south africa') || c === 'za') return 'R';
  if (curr === 'USD' || c.includes('united states') || c === 'us') return '$';

  if (currencyCode && currencyCode.length <= 4) return currencyCode;
  return '₦';
};

const DriverSubscriptionsTab = ({
  subscriptionStatus,
  subscriptionEndsAt,
  activePlan,
  user,
  onSubscriptionUpdated,
  verificationProgress,
}) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(null);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshSubscriptions();
  }, []);

  const refreshSubscriptions = async () => {
    try {
      setLoadingPlans(true);
      setError(null);

      const [plansRes, statusRes] = await Promise.all([
        api.get('/subscription/plans'),
        api.get('/subscription'),
      ]);

      if (plansRes.data.success) {
        setPlans(safeArray(plansRes.data));
        setGatewayConfigured(!!plansRes.data.payment_gateway_configured);
      }

      if (statusRes.data.success && onSubscriptionUpdated) {
        onSubscriptionUpdated({
          status: statusRes.data.status,
          expires_at: statusRes.data.expires_at,
          active_plan: statusRes.data.active_plan,
        });
      }
    } catch (err) {
      console.error('Failed to load subscription data', err);
      setError(err.response?.data?.message || 'Failed to load subscription plans.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (planId, paymentMethod = null) => {
    setIsSubscribing(planId);
    setMessage(null);
    setError(null);

    try {
      const payload = { plan_id: planId };
      if (paymentMethod) payload.payment_method = paymentMethod;

      const res = await api.post('/subscription/subscribe', payload);

      if (res.data.payment_required && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      if (res.data.success) {
        setMessage(res.data.message || 'Subscription updated successfully!');
        refreshSubscriptions();
      } else {
        setError(res.data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Subscription error', err);
      setError(err.response?.data?.message || 'Failed to process subscription.');
    } finally {
      setIsSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 px-4 pt-4 animate-fade-in">
      <p className="text-[#1cd188] text-xs font-bold uppercase tracking-widest mb-1">Driver Membership</p>
      <h1 className="text-white font-black text-xl mb-4">Subscription Plans</h1>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl mb-4 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-4 text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Active Subscription Banner */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1cd188]/10 flex items-center justify-center text-[#1cd188]">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Active Plan</p>
              <h3 className="text-white font-bold text-base">{activePlan?.name || 'Free Trial / Standard'}</h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            subscriptionStatus === 'active' ? 'bg-[#1cd188]/20 text-[#1cd188]' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {subscriptionStatus === 'active' ? 'ACTIVE' : 'TRIAL'}
          </span>
        </div>

        {subscriptionEndsAt && (
            <p className="text-slate-400 text-xs">
              Expires: <span className="text-white font-semibold">{new Date(subscriptionEndsAt).toLocaleDateString()}</span>
            </p>
          )}

          {/* Garage Mode (Pause Subscription) */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
             <div className="flex justify-between items-center gap-4">
                 <div className="flex-1">
                     <h4 className="text-white font-bold text-sm flex items-center gap-2">
                         <Shield size={14} className="text-amber-500" />
                         Garage Mode
                     </h4>
                     <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                         Car broke down? Pause your plan up to 14 days so you don't lose money. Account goes offline while paused.
                     </p>
                 </div>
                 <button onClick={() => alert('Subscription Paused! Your expiration date will be extended when you resume.')} className="bg-slate-800 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-slate-700 transition flex-shrink-0">
                     Pause Plan
                 </button>
             </div>
          </div>

        {/* 1-Click Auto-Renewal Butler */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-white text-xs font-bold">1-Click Auto-Renewal Butler</p>
            <p className="text-slate-500 text-[10px]">Automatically renews subscription seamlessly</p>
          </div>
          <button
            onClick={() => setAutoRenewal(!autoRenewal)}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
              autoRenewal ? 'bg-[#1cd188] justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
      </div>

      {/* Plans List */}
      <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3">Available Plans</h2>

      {loadingPlans ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-6 text-center text-slate-400 text-xs">
          No subscription plans available at this time.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => {
            const isCurrent = activePlan?.id === plan.id || activePlan?.name === plan.name;
            const userCountry = user?.country || user?.driver?.country || '';
            const symbol = getCurrencySymbol(userCountry, plan.currency);
            const numAmount = plan.amount !== undefined && plan.amount !== null
              ? Number(plan.amount)
              : Number(String(plan.price || 0).replace(/[^\d.]/g, ''));

            return (
              <div
                key={plan.id}
                className={`bg-slate-900/60 backdrop-blur-2xl border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isCurrent ? 'border-[#1cd188] bg-[#1cd188]/5' : 'border-white/10 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                    {isCurrent && (
                      <span className="bg-[#1cd188]/20 text-[#1cd188] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>
                  <p className="text-[#1cd188] font-black text-2xl mb-2">
                    {symbol}{numAmount.toLocaleString()} <span className="text-slate-400 text-xs font-normal">/{plan.period || plan.interval || 'month'}</span>
                  </p>
                  <p className="text-slate-400 text-xs mb-3 pb-3 border-b border-slate-700/50">{plan.description || plan.limits}</p>
                    
                    {/* Features List */}
                    {(plan.features && Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => {
                        const isZeroCommission = typeof feature === 'string' && feature.toLowerCase().includes('0% commission');
                        return (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            {isZeroCommission ? (
                                <Zap className="w-4 h-4 text-[#1cd188] mt-0.5 flex-shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-xs">
                                {feature}
                            </span>
                          </div>
                        );
                    })}
                  </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || isSubscribing === plan.id}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-[#1cd188] text-[#0f172a] hover:bg-emerald-400 shadow-lg shadow-[#1cd188]/10'
                  }`}
                >
                  {isSubscribing === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverSubscriptionsTab;
