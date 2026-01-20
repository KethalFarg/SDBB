import React from 'react';
import { X, Check, HelpCircle } from 'lucide-react';

const EnsuringYourSuccess = () => {
  return (
    <div className="w-full py-12" style={{ backgroundColor: '#e1ecf2' }}>
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-black text-[#031E2C] mb-2 uppercase tracking-tight">Ensuring Your Success</h2>
          <h3 className="text-base lg:text-xl font-bold text-gray-600 uppercase tracking-widest opacity-80">
            Why we've matched you with Dr. David Levinson
          </h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left column - Text */}
          <div className="w-full lg:flex-1">
            <div className="text-gray-700 space-y-4">
              
              {/* Doctor Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 relative overflow-hidden border border-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ea0bf]/5 rounded-full -mr-16 -mt-16"></div>
                
                {/* Preferred Provider Logo */}
                <div className="absolute top-4 right-4 hidden sm:block">
                  <img 
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/a63077fe-1911-4861-7e39-58c59de2e800/public" 
                    alt="Preferred Provider"
                    className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 relative z-10">
                  {/* Doctor Photo */}
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-[#2ea0bf]/20 flex-shrink-0 shadow-lg">
                    <img 
                      src="/lovable-uploads/f9b652e3-18f8-409d-b0fb-92c36009c008.png"
                      alt="Dr. David Levinson"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-2xl font-black text-[#031E2C] mb-1 uppercase tracking-tight">Dr David Levinson, DC</h4>
                    <p className="text-lg text-[#2ea0bf] font-bold mb-1">Back to Balance Wellness</p>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Alpharetta, Ga</p>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                    <strong className="text-[#031E2C]">Dr. David Levinson</strong> is a nationally recognized leader in non-surgical spinal care, trusted by physicians and pro athletes for his exceptional results.
                  </p>
                  
                  <ul className="space-y-3 text-gray-700 text-sm lg:text-base">
                    {[
                      "A nationally recognized pioneer in spinal decompression, trusted by doctors and professional athletes.",
                      "Serves on the official PGA TOUR medical staff, providing elite care to the world's top golfers.",
                      "Maintains a consistent record of exceptional results and high patient satisfaction."
                    ].map((text, idx) => (
                      <li key={idx} className="flex items-start bg-[#F2FAFA] p-3 rounded-xl border border-[#2ea0bf]/10">
                        <Check size={18} className="text-[#2ea0bf] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-gray-800">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Comparison Chart */}
          <div className="w-full lg:flex-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {/* Header Row */}
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                <div className="p-4 font-black text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest border-r border-gray-100">
                  The Standard of Care
                </div>
                <div className="p-4 font-black text-[10px] lg:text-xs text-center text-gray-400 uppercase tracking-widest border-r border-gray-100">
                  Random Provider
                </div>
                <div className="p-4 font-black text-[10px] lg:text-xs text-center text-[#2ea0bf] uppercase tracking-widest bg-[#F2FAFA]">
                  Preferred Provider
                </div>
              </div>
              
              {/* Data Rows */}
              <div className="divide-y divide-gray-100">
                {[
                  "Is the doctor verified for their experience?",
                  "Do they use certified, clinic-grade equipment?",
                  "Do they follow a proven treatment protocol?",
                  "Do they prepare for my visit in advance?",
                  "Am I getting a complete, optimized care system?"
                ].map((q, idx) => (
                  <div key={idx} className="grid grid-cols-3">
                    <div className="p-4 text-[11px] lg:text-sm font-bold text-gray-600 border-r border-gray-100">
                      {q}
                    </div>
                    <div className="p-4 flex justify-center items-center border-r border-gray-100">
                      {idx % 3 === 0 ? (
                        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                          <X size={14} className="text-red-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                          <HelpCircle size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex justify-center items-center bg-[#F2FAFA]/50">
                      <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                        <Check size={16} className="text-green-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer with assurance text */}
              <div className="bg-[#F2FAFA] p-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-[11px] lg:text-sm font-bold text-gray-500 italic leading-relaxed">
                    "This rigorous standard is your assurance that when you choose a Preferred Provider, your care is already optimized for the best possible outcome."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnsuringYourSuccess;