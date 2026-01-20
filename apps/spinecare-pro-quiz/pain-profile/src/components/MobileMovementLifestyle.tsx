
import React, { useEffect, useState } from 'react';
import { Armchair, User, Footprints, Package, Car } from 'lucide-react';

const MobileMovementLifestyle = () => {
  const [fillPercentage, setFillPercentage] = useState(0);
  const severity = 'severe';
  const score = '5/5';

  const severityConfig = {
    mild: { color: '#B6D8EA', percentage: 25 },
    moderate: { color: '#F2D28E', percentage: 50 },
    high: { color: '#FFB170', percentage: 75 },
    severe: { color: '#FF7F5E', percentage: 100 }
  };

  const config = severityConfig[severity];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillPercentage(config.percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [config.percentage]);

  const movementData = [
    { icon: Armchair, text: "Sitting", color: "#B6D8EA" },
    { icon: User, text: "Standing", color: "#F2D28E" },
    { icon: Footprints, text: "Walking", color: "#FFB170" },
    { icon: Package, text: "Bending / Lifting", color: "#FF7F5E" },
    { icon: Car, text: "Driving", color: "#B6D8EA" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-brand-gradient-horizontal text-white px-4 py-2 rounded-r-lg font-bold text-lg -ml-4">
          Movement & Lifestyle
        </div>
      </div>
      
      {/* Mobility Impact Index Section */}
      <div className="mt-4 flex items-center justify-between">
        {/* Left side - Text only */}
        <span className="text-[#2fa2c2] font-medium text-lg whitespace-nowrap">Mobility Impact Index</span>

        {/* Right side - Animated Color Wheel */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg
            className="w-12 h-12 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Animated fill circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={config.color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - fillPercentage / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800">{score}</span>
          </div>
        </div>
      </div>

      {/* Image, Line, and Icons Section */}
      <div className="mt-6 flex items-center gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/e9e18c9d-f4c9-4de3-e7da-3e3e2149cb00/public" 
            alt="Mobility Assessment" 
            className="h-32 object-contain" 
          />
        </div>

        {/* Vertical line */}
        <div className="w-px h-32 bg-gray-300 flex-shrink-0"></div>

        {/* Movement icons and text */}
        <div className="flex-1 space-y-2">
          {movementData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: item.color }}
              >
                <item.icon size={12} className="text-white" />
              </div>
              <span className="text-gray-700 text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severe Limitation Text Box */}
      <div className="mt-6 bg-[#F2FAFA] border border-[#2fa2c2] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-red-700 font-semibold text-sm">Severe Mobility Impact</span>
        </div>
        <p className="text-black text-sm">
          Basic activities like sitting, standing, walking, bending/lifting, and driving are all significantly impacted. This level of limitation suggests comprehensive intervention may be beneficial to restore functional independence.
        </p>
      </div>
    </div>
  );
};

export default MobileMovementLifestyle;
