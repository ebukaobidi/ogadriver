import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="text-yellow-400">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      <p className="text-sm text-gray-400 leading-snug whitespace-pre-line">{description}</p>
    </div>
  );
};

export default FeatureCard;
