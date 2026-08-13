import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  Inbox,
  Briefcase,
  CreditCard,
  Star,
  Activity,
  MapPin,
  Car,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { NotificationBell } from '../NotificationSystem';
import { MessagingButton } from '../MessagingSystem';

const DriverDashboardTab = ({ 
  driver, 
  proposals, 
  activeContracts, 
  subscriptionStatus, 
  setActiveTab,
  verificationProgress,
  dispatchStatus,
  trialStatus
}) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
    earningsTrend: 'up',
    completionRate: 0
  });

  useEffect(() => {
    // Calculate analytics from driver data
    if (driver) {
      const completedJobs = driver.completed_jobs_count || 0;
      const totalEarnings = driver.total_earnings || 0;
      const averageRating = driver.rating || 0;
      
      setAnalyticsData({
        totalEarnings,
        monthlyEarnings: totalEarnings * 0.3, // Simulated monthly earnings
        completedJobs,
        averageRating,
        earningsTrend: 'up',
        completionRate: completedJobs > 0 ? 95 : 0 // Simulated completion rate
      });
    }
  }, [driver]);

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      
      {/* Top Bar with Notifications */}
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex gap-2">
          <MessagingButton />
          <NotificationBell />
        </div>
      </div>

      {/* System Alerts & Banner */}
      {subscriptionStatus === 'expired' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm animate-pulse-slow">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="font-bold text-red-400 text-lg">Subscription Expired</h4>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Your dispatcher visibility has been suspended. Please renew your billing status to resume receiving local booking proposals.
            </p>
            <button 
              onClick={() => setActiveTab('billing')}
              className="mt-4 text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              Renew Status Now
            </button>
          </div>
        </div>
      )}

      {/* Trial Period Alert */}
      {trialStatus?.on_trial && trialStatus?.days_remaining > 0 && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm ${trialStatus.days_remaining <= 3 ? 'bg-amber-500/10 border border-amber-500/30 animate-pulse-slow' : 'bg-brandMint/10 border border-brandMint/30'}`}>
          <Clock className={`w-6 h-6 shrink-0 mt-0.5 ${trialStatus.days_remaining <= 3 ? 'text-amber-500' : 'text-brandMint'}`} />
          <div>
            <h4 className={`font-bold text-lg ${trialStatus.days_remaining <= 3 ? 'text-amber-400' : 'text-brandMint'}`}>
              Trial Period Active
            </h4>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {trialStatus.days_remaining <= 3 
                ? `Your trial period ends in ${trialStatus.days_remaining} day${trialStatus.days_remaining !== 1 ? 's' : ''}. Subscribe now to maintain your dispatch visibility.`
                : `You have ${trialStatus.days_remaining} days remaining in your trial period. Subscribe before it ends to continue receiving job proposals.`
              }
            </p>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`mt-4 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg ${trialStatus.days_remaining <= 3 ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-brandMint hover:bg-emerald-400 text-corporateNavy shadow-[0_0_15px_rgba(28,209,136,0.4)]'}`}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}

      {/* Earnings Analytics Section */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brandMint" /> Earnings Analytics
          </h3>
          <div className="flex gap-2">
            <button className="text-xs font-bold text-brandMint bg-brandMint/10 px-3 py-1.5 rounded-lg border border-brandMint/30">Monthly</button>
            <button className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700">Weekly</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Total Earnings</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${analyticsData.earningsTrend === 'up' ? 'text-brandMint' : 'text-red-500'}`}>
                {analyticsData.earningsTrend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                12%
              </div>
            </div>
            <p className="text-2xl font-black text-white">₦{analyticsData.totalEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">This Month</span>
              <div className="flex items-center gap-1 text-xs font-bold text-brandMint">
                <ArrowUpRight className="w-3 h-3" />
                8%
              </div>
            </div>
            <p className="text-2xl font-black text-white">₦{analyticsData.monthlyEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Completed Jobs</span>
              <div className="flex items-center gap-1 text-xs font-bold text-brandMint">
                <ArrowUpRight className="w-3 h-3" />
                5%
              </div>
            </div>
            <p className="text-2xl font-black text-white">{analyticsData.completedJobs}</p>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
              const heights = [40, 65, 45, 80, 55, 90];
              const height = heights[index];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-brandMint to-emerald-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => setActiveTab('proposals')}>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase group-hover:text-amber-500 transition-colors">Incoming Proposals</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-white">
              {proposals.length}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-brandMint/50 transition-colors cursor-pointer" onClick={() => setActiveTab('active')}>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase group-hover:text-brandMint transition-colors">Active Contracts</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-white">
              {activeContracts.length}
            </h3>
          </div>
          <div className="p-3 bg-brandMint/10 border border-brandMint/20 text-brandMint rounded-xl group-hover:scale-110 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setActiveTab('billing')}>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase group-hover:text-blue-400 transition-colors">Operational Wallet</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-white">
              ₦{driver?.wallet?.balance ? parseFloat(driver.wallet.balance).toLocaleString() : '0.00'}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-amber-400/50 transition-colors cursor-pointer" onClick={() => setActiveTab('ratings')}>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase group-hover:text-amber-400 transition-colors">Performance Index</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-white flex items-center gap-1.5">
              {driver?.rating || 'New'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6 fill-amber-400/20" />
          </div>
        </div>

      </div>

      {/* Operational Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Status Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick View Active Deployment */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Activity size={150} />
            </div>
            
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white relative z-10">
              <Activity className="w-5 h-5 text-brandMint" /> Active Deployments
            </h3>
            
            {activeContracts.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {activeContracts.map((contract) => (
                  <div key={contract.id} className="border border-slate-700 rounded-xl p-5 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-brandMint/50 transition-colors">
                    <div>
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono rounded uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        In Flight
                      </span>
                      <h4 className="font-bold text-lg mt-2 text-white">{contract.client_name || contract.hirer?.user?.name || 'Enterprise Route Client'}</h4>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-brandMint" /> {contract.destination || contract.pickup_location || 'Assigned Location'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('active')}
                      className="bg-brandMint/10 hover:bg-brandMint text-brandMint hover:text-corporateNavy border border-brandMint/50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(28,209,136,0.1)]"
                    >
                      Manage Flight
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-950/30 relative z-10">
                <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No active deployments. Your system status is set to standby.</p>
              </div>
            )}
          </div>

          {/* Dynamic Vetting Progress Card */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setActiveTab('compliance')}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Compliance Status</h3>
              <span className={`text-xs font-mono uppercase font-bold tracking-wider ${verificationProgress?.progress_percentage === 100 ? 'text-brandMint' : 'text-amber-500'}`}>
                {verificationProgress?.progress_percentage === 100 ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 shadow-inner">
              <div 
                className={`h-full rounded-full relative ${verificationProgress?.progress_percentage === 100 ? 'bg-gradient-to-r from-brandMint to-emerald-400' : 'bg-amber-500'}`}
                style={{ width: `${verificationProgress?.progress_percentage || 0}%` }}
              >
                {verificationProgress?.progress_percentage === 100 && (
                  <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              {verificationProgress?.progress_percentage === 100 
                ? 'Your background check processing and document validations are complete. You are fully authorized for dispatch.'
                : `Verification progress: ${verificationProgress?.progress_percentage || 0}% complete. Complete your mandatory background checks and document uploads to activate your system badge.`
              }
            </p>
          </div>

        </div>

        {/* Auxiliary Sidebar */}
        <div className="space-y-6">
          
          {/* Interactive Quick Dispatch State Toggle */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500 mb-4">
              Dispatch Terminal
            </h4>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${dispatchStatus?.eligible ? 'bg-brandMint' : 'bg-red-500'}`}></div>
              <div className={`w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor] ${dispatchStatus?.eligible ? 'bg-brandMint text-brandMint animate-pulse' : 'bg-red-500 text-red-500 animate-pulse'}`} />
              <div>
                <p className="font-bold text-sm text-white tracking-wide">
                  {dispatchStatus?.eligible ? 'AVAILABLE FOR DISPATCH' : dispatchStatus?.reason || 'NOT AVAILABLE'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dispatchStatus?.eligible 
                    ? 'Visible to matching clients and ready for duty' 
                    : dispatchStatus?.reason === 'Verification incomplete' 
                      ? 'Complete verification to become visible'
                      : dispatchStatus?.reason === 'Subscription expired'
                        ? 'Renew subscription to become visible'
                        : dispatchStatus?.reason === 'Trial period expired'
                          ? 'Subscribe to continue receiving job proposals'
                          : 'Not visible to matching clients'
                  }
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverDashboardTab;
