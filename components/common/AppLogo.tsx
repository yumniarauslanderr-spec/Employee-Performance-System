import React from 'react';

const AppLogo: React.FC<{ className?: string; }> = ({ className }) => (
  <div className={`flex items-center font-sans ${className}`}>
    <svg
      viewBox="0 0 62 70"
      className="h-[1.5em] w-auto" // Height is relative to the font size for easy scaling
      aria-label="Application Logo"
    >
        <rect x="5" y="35" width="14" height="35" rx="3" fill="#2dd4bf" />
        <rect x="24" y="20" width="14" height="50" rx="3" fill="#14b8a6" />
        <rect x="43" y="0" width="14" height="70" rx="3" fill="#0D2C54" />
    </svg>
    <div className="ml-3 flex flex-col leading-tight">
        <span className="font-bold text-gray-800 tracking-tight">Employee</span>
        <span className="font-bold text-teal-600 tracking-tight">Performance</span>
    </div>
  </div>
);

export default AppLogo;