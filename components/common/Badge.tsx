
import React from 'react';

interface BadgeProps {
  score: number; // Score out of 100
}

const Badge: React.FC<BadgeProps> = ({ score }) => {
  let colorClasses = '';
  let text = '';

  if (score >= 90) {
    colorClasses = 'bg-teal-100 text-teal-800';
    text = 'Excellent';
  } else if (score >= 75) {
    colorClasses = 'bg-sky-100 text-sky-800';
    text = 'Good';
  } else if (score >= 60) {
    colorClasses = 'bg-amber-100 text-amber-800';
    text = 'Fair';
  } else {
    colorClasses = 'bg-red-100 text-red-800';
    text = 'Poor';
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
      {text}
    </span>
  );
};

export default Badge;
