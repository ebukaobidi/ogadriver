import React from 'react';
import { Star } from 'lucide-react';

const DriverRatingsTab = ({ driver, ratings }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Employer Ratings Ledger</h3>
          <p className="text-slate-400 text-sm">Weekly & Monthly reviews from your deployments.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Overall Score</span>
          <div className="text-3xl font-black text-amber-400">{driver && driver.rating ? driver.rating : 'New'}</div>
        </div>
      </div>

      {ratings.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-mono border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">No ratings recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {ratings.map(rating => (
            <div key={rating.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white">{rating.employer}</h4>
                  <span className="text-xs font-mono text-slate-500">{rating.period}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                   <span className="font-bold text-white">{rating.score}.0</span>
                </div>
              </div>
              <p className="text-slate-300 italic text-sm">"{rating.review}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRatingsTab;
