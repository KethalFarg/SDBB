
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Armchair, User, Footprints, Package, Car, AlertCircle } from 'lucide-react';

interface MobilityImpactIndexProps {
  severity: 'mild' | 'moderate' | 'high' | 'severe';
  score: string;
}

const MobilityImpactIndex: React.FC<MobilityImpactIndexProps> = ({ severity, score }) => {
  const [fillPercentage, setFillPercentage] = useState(0);

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
    { icon: Car, text: "Driving", color: "#2ea0bf" }
  ];

  return (
    <div className="relative flex p-6">
      {/* Left side content - positioned normally */}
      <div className="flex-1 relative z-10">
        {/* Title group positioned over the content */}
        <div className="flex items-center gap-3 mb-6">
          {/* Animated Color Wheel */}
          <div className="relative w-12 h-12">
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

          {/* Title and Badge */}
          <span className="text-[#2fa2cc] font-medium text-2xl">Mobility Impact Index</span>
          <Badge
            variant="secondary"
            className="bg-gray-200 text-gray-800 hover:bg-gray-200 capitalize font-medium"
          >
            {severity}
          </Badge>
        </div>

        {/* Content area - Image and Icons */}
        <div className="flex items-center justify-center gap-8">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/e9e18c9d-f4c9-4de3-e7da-3e3e2149cb00/public"
              alt="Mobility Assessment"
              className="h-48 object-contain"
            />
          </div>

          {/* Vertical line */}
          <div className="w-px h-48 bg-gray-300"></div>

          {/* Movement icons and text */}
          <div className="flex-1 space-y-4">
            {movementData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon size={16} className="text-white" />
                </div>
                <span className="text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Container with blue gradient border and background */}
      <div className="absolute right-0 top-6 bottom-6 w-[512px] border border-[#2ea0bf] rounded-lg bg-[#2ea0bf]/10 p-6">
        <div className="space-y-4">
          {/* Top left: Caution Icon and Mobility Impact header */}
          <div className="flex items-center gap-2">
            <AlertCircle size={24} className="text-[#FF7F5E]" fill="white" />
            <h3 className="font-bold text-lg text-gray-800">Mobility Impact</h3>
          </div>

          {/* Severe limitation with red dot */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">severe limitation</span>
          </div>

          {/* Description text */}
          <p className="text-sm text-gray-600 text-left leading-relaxed">
            You indicated that basic activities like sitting, standing, walking, bending/lifting, and driving are all painful right now. When this many fundamental movements are affected, it's often a sign of a progressive condition — one that can worsen more rapidly than most expect if left untreated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobilityImpactIndex;
