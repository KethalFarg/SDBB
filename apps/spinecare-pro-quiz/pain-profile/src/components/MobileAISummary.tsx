
import React from 'react';
import { Check } from "lucide-react";

const MobileAISummary = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-brand-gradient-horizontal text-white px-4 py-2 rounded-r-lg font-bold text-lg -ml-4 flex items-center gap-3">
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
          AI Summary
        </div>
      </div>

      {/* Profile Summary box */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg mb-2">
              Profile Summary
            </h3>
            
            <p className="text-[#2fa2c2] text-sm">
              Ready for submission
            </p>
          </div>
          
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/5a03ac7a-5dea-4fa3-4813-069e04284d00/public" 
            alt="Separator" 
            className="w-16 h-16 object-contain flex-shrink-0 ml-4" 
          />
        </div>
        
        <div className="text-gray-700 text-sm leading-relaxed space-y-3">
          <p>
            You've reported chronic lower back pain with leg pain (radiculopathy) from herniated disc and sciatica, with limited mobility, disrupted daily function, and a history of minimal results from prior treatments. The severity and 3-year duration suggest a condition that may be progressive, with increasing impact over time.
          </p>
          
          <p className="border border-[#2ea0bf] bg-gray-50 p-3 rounded-lg">
            The next step is to analyze your responses to determine how closely your case aligns with successful outcomes — and whether this approach may offer a viable path forward.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileAISummary;
