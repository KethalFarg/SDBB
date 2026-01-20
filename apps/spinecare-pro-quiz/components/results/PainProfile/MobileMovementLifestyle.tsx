
import React, { useEffect, useState } from 'react';
import { Armchair, User, Footprints, Package, Car, HelpCircle, Activity } from 'lucide-react';
import { useQuiz } from '../../../context/QuizContext';

const MobileMovementLifestyle = () => {
  const { state } = useQuiz();
  const { answers } = state;
  const [fillPercentage, setFillPercentage] = useState(0);
  
  const triggers = (answers['movement-triggers'] as string[]) || [];
  const score = `${triggers.length}/5`;
  
  // Calculate severity based on number of triggers
  let severity: 'mild' | 'moderate' | 'high' | 'severe' = 'mild';
  if (triggers.length >= 5) severity = 'severe';
  else if (triggers.length >= 3) severity = 'high';
  else if (triggers.length >= 2) severity = 'moderate';

  const severityConfig = {
    mild: { color: '#B6D8EA', percentage: 25, label: 'Mild Mobility Impact' },
    moderate: { color: '#F2D28E', percentage: 50, label: 'Moderate Mobility Impact' },
    high: { color: '#FFB170', percentage: 75, label: 'High Mobility Impact' },
    severe: { color: '#FF7F5E', percentage: 100, label: 'Severe Mobility Impact' }
  };

  const config = severityConfig[severity];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillPercentage(config.percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [config.percentage]);

  const movementIcons: Record<string, any> = {
    'Sitting': Armchair,
    'Standing': User,
    'Walking': Footprints,
    'Bending / lifting': Package,
    'Driving': Car,
    'Coughing / sneezing': Activity
  };

  const movementData = triggers.map(t => ({
    icon: movementIcons[t] || HelpCircle,
    text: t,
    color: config.color
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-brand-gradient-horizontal text-white px-4 py-2 rounded-r-lg font-bold text-lg -ml-4 uppercase tracking-tight">
          Movement & Lifestyle
        </div>
      </div>
      
      {/* Mobility Impact Index Section */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[#2fa2c2] font-bold text-lg uppercase tracking-tight">Mobility Impact Index</span>

        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="10" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={config.color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - fillPercentage / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-gray-800">{score}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="flex-shrink-0">
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/e9e18c9d-f4c9-4de3-e7da-3e3e2149cb00/public" 
            alt="Mobility Assessment" 
            className="h-32 w-auto object-contain" 
          />
        </div>

        <div className="w-px h-28 bg-gray-200 flex-shrink-0"></div>

        <div className="flex-1 space-y-3">
          {movementData.length > 0 ? movementData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                <item.icon size={14} className="text-white" />
              </div>
              <span className="text-gray-800 font-bold text-xs uppercase tracking-tight">{item.text}</span>
            </div>
          )) : (
            <p className="text-gray-400 text-xs italic">No specific movement triggers reported.</p>
          )}
        </div>
      </div>

      <div className={`mt-6 bg-[#F2FAFA] border-l-4 rounded-lg p-4 transition-colors duration-500`} style={{ borderColor: config.color }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: config.color }}></div>
          <span className="font-black text-sm uppercase tracking-wide" style={{ color: config.color }}>{config.label}</span>
        </div>
        <p className="text-[#031E2C] text-sm font-medium leading-relaxed">
          {triggers.length > 0 
            ? `Activities like ${triggers.join(', ').toLowerCase()} are significantly impacted. This level of limitation suggests comprehensive intervention may be beneficial to restore functional independence.`
            : "Your reported activity levels suggest a specific pattern of limitation that warrants further evaluation to restore full functional independence."
          }
        </p>
      </div>
    </div>
  );
};

export default MobileMovementLifestyle;
