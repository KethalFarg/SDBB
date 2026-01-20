
import React from 'react';
import { Lightbulb } from 'lucide-react';

const NextStepsSection = () => {
  return (
    <div className="w-full py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Recommended Next Steps Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Orange circle with white fill and orange lightbulb icon */}
            <div className="bg-white border-2 rounded-full p-3 flex-shrink-0" style={{ borderColor: '#fa684b' }}>
              <Lightbulb className="w-6 h-6" style={{ color: '#fa684b' }} />
            </div>
            <h2 className="text-2xl font-bold text-black">
              Recommended Next Steps
            </h2>
          </div>
          
          {/* Container with drop shadow */}
          <div className="flex shadow-lg rounded-lg overflow-hidden mb-12">
            {/* Left column - shorter horizontally */}
            <div className="bg-teal-primary p-6 flex items-center justify-center" style={{ flex: '0 0 35%' }}>
              <h3 className="text-white font-bold text-lg text-center">
                Initial consultation with trial treatment
              </h3>
            </div>

            {/* Right column */}
            <div className="bg-[#F4F5F7] p-6 flex items-center" style={{ flex: '1' }}>
              <p className="text-teal-primary text-base">
                Comprehensive evaluation of your condition and medical history to identify your specific needs.
              </p>
            </div>
          </div>
        </div>

        {/* Three columns with equal spacing */}
        <div className="grid grid-cols-3 gap-8">
          {/* Step 1 Container */}
          <div className="rounded-lg shadow-lg overflow-hidden">
            {/* Top section with light gray background and circle */}
            <div className="h-32 flex flex-col items-center justify-center" style={{ backgroundColor: '#EEF1F2' }}>
              <div className="relative w-12 h-12 mb-3">
                {/* White circle with blue border */}
                <div className="w-full h-full rounded-full bg-white border-2 border-teal-primary flex items-center justify-center shadow-lg">
                  <span className="text-teal-primary font-bold text-xl">1</span>
                </div>
              </div>
              {/* Title below circle */}
              <h3 className="text-lg font-bold text-black text-center">Diagnostic Mapping</h3>
            </div>
            
            {/* Bottom section with solid teal background - reduced height */}
            <div className="h-32 bg-teal-primary p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-base">Comprehensive evaluation of your condition and medical history to identify your specific needs.</p>
              </div>
            </div>
          </div>

          {/* Step 2 Container */}
          <div className="rounded-lg shadow-lg overflow-hidden">
            {/* Top section with light gray background and circle */}
            <div className="h-32 flex flex-col items-center justify-center" style={{ backgroundColor: '#EEF1F2' }}>
              <div className="relative w-12 h-12 mb-3">
                {/* White circle with blue border */}
                <div className="w-full h-full rounded-full bg-white border-2 border-teal-primary flex items-center justify-center shadow-lg">
                  <span className="text-teal-primary font-bold text-xl">2</span>
                </div>
              </div>
              {/* Title below circle */}
              <h3 className="text-lg font-bold text-black text-center">Trial Treatment</h3>
            </div>
            
            {/* Bottom section with solid teal background - reduced height */}
            <div className="h-32 bg-teal-primary p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-base">Experience the treatment first-hand with your first targeted treatment session</p>
              </div>
            </div>
          </div>

          {/* Step 3 Container */}
          <div className="rounded-lg shadow-lg overflow-hidden">
            {/* Top section with light gray background and circle */}
            <div className="h-32 flex flex-col items-center justify-center" style={{ backgroundColor: '#EEF1F2' }}>
              <div className="relative w-12 h-12 mb-3">
                {/* White circle with blue border */}
                <div className="w-full h-full rounded-full bg-white border-2 border-teal-primary flex items-center justify-center shadow-lg">
                  <span className="text-teal-primary font-bold text-xl">3</span>
                </div>
              </div>
              {/* Title below circle */}
              <h3 className="text-lg font-bold text-black text-center">Personalized Plan</h3>
            </div>
            
            {/* Bottom section with solid teal background - reduced height */}
            <div className="h-32 bg-teal-primary p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-base">Custom treatment schedule based on your specific needs to achieve optimal pain reduction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextStepsSection;
