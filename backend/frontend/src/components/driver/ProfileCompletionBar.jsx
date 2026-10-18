import React from 'react';

const ProfileCompletionBar = ({ user, driver, verificationProgress }) => {
  // Use the database-provided verification progress if available, otherwise fallback to driver verified status
  let score = typeof verificationProgress === 'number' 
    ? verificationProgress 
    : (parseInt(verificationProgress) || 0);

  if (!score || score === 0) {
    if (driver?.is_verified || driver?.status === 'active' || driver?.status === 'approved') {
      score = 100;
    } else {
      // Fallback base calculation if API doesn't provide progress
      score = 20;
      if (user?.avatar) score += 20;
      if (user?.phone) score += 20;
      if (driver?.documents?.length > 0) score += 20;
    }
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm">Profile Completion</h3>
        <span className="text-brandMint font-black text-sm">{score}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brandMint rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${score}%` }}
        />
      </div>
      {score < 100 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Upload all required compliance documents and update your profile picture to reach 100%.
        </p>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
