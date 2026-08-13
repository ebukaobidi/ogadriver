import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle2, Wallet, RefreshCw, AlertCircle, Shield, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';

const DriverBillingTab = ({
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
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isPayingVerification, setIsPayingVerification] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshBillingData();
  }, []);

  const refreshBillingData = async () => {
    try {
      setLoadingPlans(true);
      setError(null);

      const [plansRes, walletRes, statusRes] = await Promise.all([
        api.get('/subscription/plans'),
        api.get('/wallet'),
        api.get('/subscription'),
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.data || []);
        setGatewayConfigured(!!plansRes.data.payment_gateway_configured);
      }

      if (walletRes.data.success) {
        setWallet(walletRes.data.wallet);
        setTransactions(walletRes.data.transactions || []);
        setGatewayConfigured((prev) => prev || !!walletRes.data.payment_gateway_configured);
      }

      if (statusRes.data.success && onSubscriptionUpdated) {
        onSubscriptionUpdated({
          status: statusRes.data.status,
          expires_at: statusRes.data.expires_at,
          active_plan: statusRes.data.active_plan,
        });
      }
    } catch (err) {
      console.error('Failed to load billing data', err);
      setError(err.response?.data?.message || 'Failed to load billing data.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePayVerificationFee = async () => {
    setIsPayingVerification(true);
    setError(null);
    try {
        const res = await api.post('/payments/verification-fee');
        if (res.data.success && res.data.payment.authorization_url) {
            window.location.href = res.data.payment.authorization_url;
        } else {
            setError(res.data.message || 'Payment initiation failed.');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Payment initiation failed.');
    } finally {
        setIsPayingVerification(false);
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
        setMessage(res.data.message || 'Subscription activated successfully.');
        await refreshBillingData();
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated({
            status: 'active',
            expires_at: res.data.expires_at,
            active_plan: res.data.active_plan,
          });
        }
      } else {
        setError(res.data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Subscription failed', err);
      setError(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(null);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 100) {
      setError('Minimum top-up amount is ₦100.');
      return;
    }

    setIsToppingUp(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/wallet/topup', { amount });
      if (res.data.payment_required && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }
      setError(res.data.message || 'Unable to start top-up.');
    } catch (err) {
      setError(err.response?.data?.message || 'Top-up failed. Please try again.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const displayPlan = activePlan || user?.driver?.subscription_tier || 'None';
  const isActive = subscriptionStatus === 'active';
  const walletBalance = parseFloat(wallet?.available_balance ?? wallet?.balance ?? 0);

  // Check if driver is verified
  const isVerified = verificationProgress?.progress_percentage === 100 || verificationProgress?.status === 'verified';
  const verificationStatus = verificationProgress?.status || 'pending';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Verification Required Alert */}
      {!isVerified && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-6 py-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">Verification Required for Subscription</h4>
              <p className="text-sm opacity-90 mb-3">
                Complete your verification process before subscribing. Unverified operatives cannot access the directory or receive job proposals.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-amber-500/20 px-2 py-1 rounded">
                  Progress: {verificationProgress?.progress_percentage || 0}%
                </span>
                <span className="bg-amber-500/20 px-2 py-1 rounded">
                  Status: {verificationStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-brandMint/10 border border-brandMint/30 text-brandMint rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!gatewayConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-4 py-3 text-sm">
          Payment gateway is not configured. Free plans still work. Paid plans require wallet balance or a configured payment gateway.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard size={100} className={isActive ? 'text-brandMint' : 'text-red-500'} />
          </div>
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-1">Directory Status</h3>
          {isActive ? (
            <>
              <div className="text-3xl font-black text-white mb-2">ACTIVE</div>
              <p className="text-brandMint font-bold text-lg mb-1">{displayPlan}</p>
              <p className="text-sm text-slate-400">
                {subscriptionEndsAt
                  ? `Expires ${new Date(subscriptionEndsAt).toLocaleString()}`
                  : 'Your profile is visible to employers.'}
              </p>
            </>
          ) : subscriptionStatus === 'loading' ? (
            <div className="text-slate-400 flex items-center gap-2 mt-2">
              <Loader2 className="animate-spin" size={18} /> Checking subscription...
            </div>
          ) : (
            <>
              <div className="text-3xl font-black text-red-500 mb-2">INACTIVE</div>
              <p className="text-sm text-slate-400">Subscribe below to appear in the matchmaking directory.</p>
            </>
          )}
          <button
            onClick={refreshBillingData}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brandMint"
          >
            <RefreshCw size={14} /> Refresh status
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wallet className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Wallet Balance</h3>
              <p className="text-2xl font-black text-white">
                ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <form onSubmit={handleTopUp} className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min="100"
              step="100"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Amount (₦)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brandMint outline-none"
            />
            <button
              type="submit"
              disabled={isToppingUp || !gatewayConfigured}
              className="px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-400 disabled:opacity-50"
            >
              {isToppingUp ? 'Redirecting...' : 'Fund Wallet'}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-3">
            Top-ups are processed via the configured payment gateway. Funds can then be used to pay for subscription plans.
          </p>
        </div>
      </div>

      {!user.driver?.verification_fee_paid && (
        <div className="bg-brandMint/10 border border-brandMint/30 text-brandMint rounded-xl px-6 py-4 mt-6">
          <h4 className="font-bold text-lg mb-2">Driver Verification Fee</h4>
          <p className="text-sm opacity-90 mb-4">
            Pay the required verification fee of ₦1,000 to complete your driver status.
          </p>
          <button
            onClick={handlePayVerificationFee}
            disabled={isPayingVerification}
            className="bg-brandMint text-corporateNavy px-6 py-2 rounded-xl font-black uppercase tracking-wider hover:bg-mint-600 disabled:opacity-50"
          >
            {isPayingVerification ? 'Redirecting...' : 'Pay ₦1,000 Now'}
          </button>
        </div>
      )}

      <h3 className="text-2xl font-black text-white uppercase mt-8 mb-4">Operative Subscription Plans</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingPlans ? (
          <div className="col-span-3 py-12 flex justify-center text-brandMint">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center text-slate-500 py-10 border border-slate-800 rounded-2xl">
            No subscription plans available. Ask an admin to publish operative plans.
          </div>
        ) : (
          plans.map((plan) => {
            const amount = Number(plan.amount ?? 0);
            const isCurrent = isActive && displayPlan === plan.name;
            const canPayWallet = amount > 0 && walletBalance >= amount;

            return (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col">
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-brandMint text-corporateNavy text-[10px] font-black px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                <div className="text-3xl font-black text-brandMint mb-1">{plan.price}</div>
                <p className="text-xs font-mono text-slate-500 uppercase mb-4">{plan.period}</p>
                <ul className="space-y-2 mb-6 flex-1 text-slate-400 text-sm">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle2 className="w-4 h-4 text-brandMint shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-800 text-brandMint rounded-xl text-sm font-black"
                  >
                    CURRENT PLAN
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled={isSubscribing === plan.id || (amount > 0 && !canPayWallet && !gatewayConfigured) || !isVerified}
                      onClick={() => handleSubscribe(plan.id, canPayWallet ? 'wallet' : 'paystack')}
                      className={`w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50 ${
                        !isVerified
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-brandMint text-corporateNavy hover:bg-emerald-400'
                      }`}
                    >
                      {!isVerified ? 'Complete Verification First' : isSubscribing === plan.id ? 'PROCESSING...' : 'Subscribe'}
                    </button>
                    {!isVerified && (
                      <p className="text-xs text-amber-400 mt-2 text-center">
                        <Shield className="w-3 h-3 inline mr-1" />
                        Verification required before subscription
                      </p>
                    )}
                    {isVerified && amount > 0 && !canPayWallet && !gatewayConfigured && (
                      <p className="text-xs text-amber-400 mt-2">
                        This plan requires wallet funds or a configured payment gateway.
                      </p>
                    )}
                    {isVerified && amount > 0 && canPayWallet && gatewayConfigured && (
                      <button
                        disabled={isSubscribing === plan.id}
                        onClick={() => handleSubscribe(plan.id, 'paystack')}
                        className="w-full py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:border-brandMint hover:text-brandMint disabled:opacity-50"
                      >
                        Pay with card instead
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8">
        <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-slate-800 pb-3">
          Billing History
        </h4>
        <div className="space-y-3 text-sm">
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <CreditCard className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500">No billing history yet.</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.id || txn.reference}
                className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-300">{txn.description || 'Transaction'}</div>
                  <div className="text-xs font-mono text-slate-500">
                    {txn.reference} • {new Date(txn.created_at).toLocaleString()}
                    {txn.category ? ` • ${txn.category}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${txn.type === 'credit' ? 'text-brandMint' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₦{parseFloat(txn.amount).toLocaleString()}
                  </div>
                  <div
                    className={`text-xs font-mono uppercase ${
                      txn.status === 'completed' || txn.status === 'successful'
                        ? 'text-brandMint'
                        : 'text-amber-500'
                    }`}
                  >
                    {txn.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverBillingTab;
