

import React from 'react';
import { Gift, Unlock } from 'lucide-react';

const SpecialPackageSection = () => {
  return (
    <div className="w-full py-16 pb-24 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-gray-800">You've Unlocked a Special New Patient Package</h2>
            <div className="bg-gray-100 rounded-full p-3 shadow-lg">
              <Unlock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <p className="text-lg text-gray-600">Schedule your trial treatment today</p>
        </div>

        {/* Dark backdrop for the container */}
        <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl">
          {/* Container with drop shadow and background */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 flex overflow-hidden">
            {/* Left Column - White square that spans full height */}
            <div className="bg-white rounded-l-2xl p-8 flex justify-center items-center space-x-8 flex-1">
              {/* Gift Icon */}
              <div className="bg-gray-100 rounded-full p-6 shadow-lg">
                <Gift className="w-16 h-16 text-gray-600" />
              </div>
              
              {/* Unlock Icon */}
              <div className="bg-gray-100 rounded-full p-6 shadow-lg">
                <Unlock className="w-16 h-16 text-gray-600" />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex-1 p-8 space-y-6">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Special New Patient Package</h2>
                <p className="text-xl mb-6">Start your recovery journey with our comprehensive introductory package</p>
                
                {/* Pricing Container */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg text-white/70 line-through">Normally $297</span>
                    <span className="text-4xl font-bold text-white">$79</span>
                  </div>
                  
                  {/* Package Includes */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white mb-3">Package Includes:</h4>
                    <ul className="space-y-2 text-white/90">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Comprehensive consultation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Diagnostic evaluation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Trial treatment session</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Personalized treatment plan</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Footer text */}
                <p className="text-sm text-white/70 mt-4">
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

