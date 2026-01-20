
import React from 'react';
import { useQuiz } from '../../../context/QuizContext';

const MobileAISummary = () => {
  const { state } = useQuiz();
  const { answers } = state;

  const diagnoses = Array.isArray(answers['diagnosis']) 
    ? answers['diagnosis'].join(' and ').toLowerCase() 
    : 'spinal conditions';
    
  const location = Array.isArray(answers['pain-regions']) 
    ? answers['pain-regions'].join(', ').toLowerCase() 
    : 'lower back';

  const duration = answers['duration'] || 'an extended period';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative mb-24 md:mb-32">
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-brand-gradient-horizontal text-white px-4 py-2 rounded-r-lg font-black text-lg -ml-4 flex items-center gap-3 uppercase tracking-tight">
          <div className="ai-loader">
            <div className="square" id="sq1"></div>
            <div className="square" id="sq2"></div>
            <div className="square" id="sq3"></div>
            <div className="square" id="sq4"></div>
            <div className="square" id="sq5"></div>
            <div className="square" id="sq6"></div>
            <div className="square" id="sq7"></div>
            <div className="square" id="sq8"></div>
            <div className="square" id="sq9"></div>
          </div>
          AI Analysis
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ea0bf]/5 rounded-full -mr-16 -mt-16 animate-pulse"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="font-black text-2xl text-[#031E2C] mb-1 tracking-tight uppercase">
              Clinical Summary
            </h3>
            
            <p className="text-[#2fa2c2] font-bold text-sm tracking-widest uppercase">
              Ready for Submission
            </p>
          </div>
          
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/5a03ac7a-5dea-4fa3-4813-069e04284d00/public" 
            alt="Clinical Logo" 
            className="w-14 h-14 object-contain flex-shrink-0 ml-4 opacity-80" 
          />
        </div>
        
        <div className="text-gray-700 text-base leading-relaxed space-y-4 relative z-10">
          <p className="font-medium italic border-l-4 border-[#2ea0bf] pl-4 py-1 bg-gray-50/50">
            "You've reported chronic {location} pain from {diagnoses}, with limited mobility and a history of minimal results from prior treatments. The severity and {duration} duration suggest a condition that may be progressive without targeted intervention."
          </p>
          
          <div className="pt-2">
            <p className="border-2 border-dashed border-[#2ea0bf]/30 bg-[#F2FAFA]/50 p-4 rounded-xl text-[#031E2C] font-semibold text-sm">
              The next step is to analyze your full profile to determine how closely your case aligns with clinical patterns seen in patients who improve — and whether this approach offer a viable path forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAISummary;
