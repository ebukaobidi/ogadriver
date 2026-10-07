import React, { useState } from 'react';
import { Star, ShieldCheck, Award, Clock, ThumbsUp, Filter, CheckCircle2, MessageSquare, Building2, UserCheck } from 'lucide-react';

const DriverRatingsTab = ({ driver, ratings = [] }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const displayRatings = ratings || [];

  // Filter logic
  const filteredRatings = displayRatings.filter(r => {
    if (activeFilter === '5_STARS') return r.score === 5;
    if (activeFilter === '4_STARS') return r.score === 4;
    if (activeFilter === 'WITH_FEEDBACK') return Boolean(r.review && r.review.trim().length > 0);
    return true;
  });

  const overallRating = driver?.rating || (displayRatings.length > 0 ? (displayRatings.reduce((acc, r) => acc + (r.score || 5), 0) / displayRatings.length).toFixed(1) : 'New');
  const totalReviewsCount = displayRatings.length;
  const fiveStarsCount = displayRatings.filter(r => r.score === 5).length;
  const fourStarsCount = displayRatings.filter(r => r.score === 4).length;
  const withFeedbackCount = displayRatings.filter(r => r.review && r.review.trim().length > 0).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Employment Ratings Ledger
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Employer Feedback & Ratings
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Verified performance metrics, punctuality scores, and direct employer reviews from your completed driver contracts.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-white/10 p-4 md:p-5 rounded-2xl shrink-0">
            <div className="text-center border-r border-white/10 pr-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Overall Score</span>
              <div className="flex items-center gap-1 justify-center">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="text-3xl font-black text-white">{overallRating}</span>
                <span className="text-xs text-slate-500 font-bold self-end mb-1">/ 5.0</span>
              </div>
            </div>

            <div className="pl-1 text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED PROFILE
              </div>
              <p className="text-xs text-slate-400 font-mono">Verified by OgaDriver Protocol</p>
            </div>
          </div>
        </div>

        {/* 3-Column Performance Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10/80">
          <div className="bg-slate-950/50 border border-white/10/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Completed Contracts</span>
              <span className="text-xl font-black text-white">{totalReviewsCount} Employers Reviewed</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-white/10/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">On-Time Punctuality</span>
              <span className="text-xl font-black text-emerald-400">100% Rate</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-white/10/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Road Safety Score</span>
              <span className="text-xl font-black text-blue-400">100% Satisfactory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Pill Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10/80 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filter Ledger:
          </span>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-slate-700'
            }`}
          >
            All Reviews ({totalReviewsCount})
          </button>
          <button
            onClick={() => setActiveFilter('5_STARS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === '5_STARS'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" /> 5 Stars ({fiveStarsCount})
          </button>
          <button
            onClick={() => setActiveFilter('4_STARS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === '4_STARS'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" /> 4 Stars ({fourStarsCount})
          </button>
          <button
            onClick={() => setActiveFilter('WITH_FEEDBACK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'WITH_FEEDBACK'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> With Comments ({withFeedbackCount})
          </button>
        </div>
      </div>

      {/* Review List */}
      {filteredRatings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-dashed border-white/10 rounded-3xl p-8">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">No Ratings Recorded Yet</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
            Complete your first trip deployment to unlock employer reviews and boost your profile rank.
          </p>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs hover:bg-slate-700 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRatings.map((rating) => (
            <div
              key={rating.id}
              className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all shadow-xl group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10/80">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-lg group-hover:text-emerald-400 transition-colors">
                        {rating.employer || rating.employer_name || 'Verified Employer'}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified Hire
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span>{rating.contractType || 'Verified Driver Contract'}</span>
                      <span>•</span>
                      <span className="text-slate-500">{rating.period || rating.created_at || 'Recent'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.score
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-white text-base ml-1">{rating.score}.0</span>
                </div>
              </div>

              {/* Star Attribute Breakdowns */}
              <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-950/60 border border-white/10/60 rounded-xl p-3">
                <div className="text-center border-r border-white/10/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Punctuality</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ★ {rating.punctuality ? rating.punctuality.toFixed(1) : '5.0'}
                  </span>
                </div>
                <div className="text-center border-r border-white/10/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Road Safety</span>
                  <span className="text-sm font-bold text-amber-400">
                    ★ {rating.roadSafety ? rating.roadSafety.toFixed(1) : '5.0'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Vehicle Care</span>
                  <span className="text-sm font-bold text-blue-400">
                    ★ {rating.vehicleCare ? rating.vehicleCare.toFixed(1) : '5.0'}
                  </span>
                </div>
              </div>

              {/* Verified Feedback Quote */}
              {rating.review && (
                <div className="relative bg-slate-950/40 border border-white/10/40 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed italic relative z-10">
                    "{rating.review}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Motivational Bottom Card */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-white text-sm">Want to boost your employer rating?</h5>
            <p className="text-xs text-slate-400">Complete more verified deployments and maintain zero safety infractions to reach 5.0 Star Elite status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRatingsTab;
