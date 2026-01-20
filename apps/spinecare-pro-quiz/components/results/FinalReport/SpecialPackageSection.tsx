

import React from 'react';
import { Gift, Unlock } from 'lucide-react';

const SpecialPackageSection = () => {
  return (
    <div className="w-full py-16 pb-24 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <h2 className="text-2xl lg:text-4xl font-black text-[#031E2C] uppercase tracking-tight">You've Unlocked a Special New Patient Package</h2>
            <div className="bg-white rounded-full p-3 shadow-lg border border-gray-100">
              <Unlock className="w-6 h-6 lg:w-8 lg:h-8 text-[#fa684b]" />
            </div>
          </div>
          <p className="text-lg lg:text-xl font-bold text-gray-500 uppercase tracking-widest opacity-80">Schedule your trial treatment today</p>
        </div>

        {/* Dark backdrop for the container */}
        <div className="bg-gradient-to-br from-[#031E2C] to-[#004B5C] rounded-[2.5rem] p-4 lg:p-6 shadow-2xl overflow-hidden border-4 border-white/10">
          {/* Container with drop shadow and background */}
          <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-white/10 flex flex-col lg:flex-row overflow-hidden">
            {/* Top/Left Column - Visual Indicators */}
            <div className="bg-white p-8 lg:p-12 flex justify-center items-center gap-6 lg:gap-8 lg:w-[40%]">
              {/* Gift Icon */}
              <div className="bg-[#F2FAFA] rounded-full p-6 lg:p-8 shadow-inner border border-[#2ea0bf]/10">
                <Gift className="w-12 h-12 lg:w-16 lg:h-16 text-[#2ea0bf]" />
              </div>
              
              {/* Unlock Icon */}
              <div className="bg-[#F2FAFA] rounded-full p-6 lg:p-8 shadow-inner border border-[#2ea0bf]/10">
                <Unlock className="w-12 h-12 lg:w-16 lg:h-16 text-[#fa684b]" />
              </div>
            </div>

            {/* Bottom/Right Column - Content */}
            <div className="flex-1 p-8 lg:p-12 space-y-6 flex flex-col justify-center">
              <div className="text-white text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-black mb-2 uppercase tracking-tight">Special New Patient Package</h3>
                <p className="text-base lg:text-lg font-bold text-white/70 mb-8 uppercase tracking-widest leading-relaxed">Start your recovery journey with our comprehensive introductory package</p>
                
                {/* Pricing Container */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="text-center sm:text-left">
                      <p className="text-xs lg:text-sm font-black text-white/50 uppercase tracking-[0.2em] mb-1">Limited Time Offer</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl lg:text-2xl text-white/40 line-through font-bold">$297</span>
                        <span className="text-5xl lg:text-6xl font-black text-white">$79</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#fa684b] px-4 py-2 rounded-full shadow-lg animate-pulse">
                      <span className="text-xs font-black text-white uppercase tracking-widest">Unlocked</span>
                    </div>
                  </div>
                  
                  {/* Package Includes */}
                  <div className="space-y-4 relative z-10">
                    <h4 className="font-black text-white uppercase tracking-widest text-xs lg:text-sm border-b border-white/10 pb-2 mb-4">Package Includes:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-white/90">
                      {[
                        "Comprehensive consultation",
                        "Diagnostic evaluation",
                        "Trial treatment session",
                        "Personalized treatment plan"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#2ea0bf] rounded-full shadow-[0_0_10px_#2ea0bf]"></div>
                          <span className="text-xs lg:text-sm font-bold uppercase tracking-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Footer text */}
                <p className="text-[10px] lg:text-xs font-black text-white/40 uppercase tracking-[0.3em] mt-8 text-center lg:text-left">
                  Limited spots available. Schedule your consultation today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialPackageSection;

