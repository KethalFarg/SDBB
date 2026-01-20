
import React from 'react';
import { Lightbulb } from 'lucide-react';

const NextStepsSection = () => {
  return (
    <div className="w-full py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Recommended Next Steps Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Orange circle with white fill and orange lightbulb icon */}
            <div className="bg-white border-2 rounded-full p-3 flex-shrink-0" style={{ borderColor: '#fa684b' }}>
              <Lightbulb className="w-6 h-6" style={{ color: '#fa684b' }} />
            </div>
            <h2 className="text-2xl font-black text-[#031E2C] uppercase tracking-tight">
              Recommended Next Steps
            </h2>
          </div>
          
          {/* Container with drop shadow */}
          <div className="flex flex-col sm:flex-row shadow-xl rounded-3xl overflow-hidden mb-12 border border-gray-100">
            {/* Left column */}
            <div className="bg-[#004B5C] p-6 lg:p-8 flex items-center justify-center sm:w-[35%]">
              <h3 className="text-white font-black text-xl lg:text-2xl text-center uppercase tracking-tight">
                Initial consultation
              </h3>
            </div>

            {/* Right column */}
            <div className="bg-[#F4F5F7] p-6 lg:p-8 flex items-center flex-1">
              <p className="text-[#004B5C] text-lg font-bold">
                Comprehensive evaluation of your condition and medical history to identify your specific needs.
              </p>
            </div>
          </div>
        </div>

        {/* Three columns with equal spacing - stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              step: 1,
              title: "Diagnostic Mapping",
              desc: "Comprehensive evaluation of your condition and medical history to identify your specific needs."
            },
            {
              step: 2,
              title: "Trial Treatment",
              desc: "Experience the treatment first-hand with your first targeted treatment session"
            },
            {
              step: 3,
              title: "Personalized Plan",
              desc: "Custom treatment schedule based on your specific needs to achieve optimal pain reduction."
            }
          ].map((item, idx) => (
            <div key={idx} className="rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
              {/* Top section with light gray background and circle */}
              <div className="h-32 flex flex-col items-center justify-center bg-[#EEF1F2]">
                <div className="relative w-12 h-12 mb-3">
                  {/* White circle with blue border */}
                  <div className="w-full h-full rounded-full bg-white border-2 border-[#004B5C] flex items-center justify-center shadow-lg">
                    <span className="text-[#004B5C] font-black text-2xl">{item.step}</span>
                  </div>
                </div>
                {/* Title below circle */}
                <h3 className="text-lg font-black text-[#031E2C] text-center uppercase tracking-tight">{item.title}</h3>
              </div>
              
              {/* Bottom section with solid teal background */}
              <div className="flex-1 bg-[#004B5C] p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center text-white/90">
                  <p className="text-sm lg:text-base font-bold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NextStepsSection;
