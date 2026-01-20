import React from 'react';
import { X, Check, HelpCircle } from 'lucide-react';

const EnsuringYourSuccess = () => {
  return (
    <div className="w-full py-12" style={{ backgroundColor: '#e1ecf2' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Ensuring Your Success</h2>
          <h3 className="text-xl font-semibold text-gray-800">
            Why we've matched you with Dr. David Levinson
          </h3>
        </div>
        
        <div className="flex gap-8">
          {/* Left column - Text */}
          <div className="flex-1">
            <div className="text-gray-700 space-y-4">
              
              {/* Doctor Profile Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                {/* Preferred Provider Logo */}
                <div className="absolute top-4 right-4">
                  <img 
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/a63077fe-1911-4861-7e39-58c59de2e800/public" 
                    alt="Preferred Provider"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                  {/* Doctor Photo */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-teal-500 flex-shrink-0">
                    <img 
                      src="/lovable-uploads/f9b652e3-18f8-409d-b0fb-92c36009c008.png"
                      alt="Dr. David Levinson"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-1">Dr David Levinson, DC</h4>
                    <p className="text-lg text-gray-700 font-medium mb-1">Back to Balance Wellness</p>
                    <p className="text-gray-600">Alpharetta, Ga</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  <strong>Dr. David Levinson</strong> A nationally recognized leader in non-surgical spinal care, Dr. David Levinson is trusted by physicians and pro athletes for his exceptional results.
                </p>
                
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    A nationally recognized pioneer in spinal decompression, trusted by doctors and professional athletes.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Serves on the official PGA TOUR medical staff, providing elite care to the world's top golfers.
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Maintains a consistent record of exceptional results and high patient satisfaction.
                  </li>
                </ul>
                
                <div className="text-center">
                  <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
                    see scheduling availability below
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Comparison Chart */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-3 bg-gray-50 border-b">
                <div className="p-4 font-semibold text-gray-800 border-r">
                  The Standard of Care
                </div>
                <div className="p-4 font-semibold text-center text-gray-800 border-r">
                  Random Provider<br/>
                  <span className="text-sm font-normal text-gray-600">(found online)</span>
                </div>
                <div className="p-4 font-semibold text-center text-gray-800 bg-blue-50">
                  Your Preferred Provider
                </div>
              </div>
              
              {/* Data Rows */}
              <div className="divide-y">
                {/* Row 1 */}
                <div className="grid grid-cols-3">
                  <div className="p-4 text-sm text-gray-700 border-r">
                    Is the doctor verified for their experience?
                  </div>
                  <div className="p-4 flex justify-center items-center border-r">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <X size={16} className="text-red-600" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-center items-center bg-green-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Row 2 */}
                <div className="grid grid-cols-3">
                  <div className="p-4 text-sm text-gray-700 border-r">
                    Do they use certified, clinic-grade equipment?
                  </div>
                  <div className="p-4 flex justify-center items-center border-r">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <HelpCircle size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-center items-center bg-green-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Row 3 */}
                <div className="grid grid-cols-3">
                  <div className="p-4 text-sm text-gray-700 border-r">
                    Do they follow a proven treatment protocol?
                  </div>
                  <div className="p-4 flex justify-center items-center border-r">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <HelpCircle size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-center items-center bg-green-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Row 4 */}
                <div className="grid grid-cols-3">
                  <div className="p-4 text-sm text-gray-700 border-r">
                    Do they prepare for my visit in advance?
                  </div>
                  <div className="p-4 flex justify-center items-center border-r">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <X size={16} className="text-red-600" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-center items-center bg-green-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Row 5 */}
                <div className="grid grid-cols-3">
                  <div className="p-4 text-sm text-gray-700 border-r">
                    Am I getting a complete, optimized care system?
                  </div>
                  <div className="p-4 flex justify-center items-center border-r">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <X size={16} className="text-red-600" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-center items-center bg-green-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer with assurance text */}
              <div className="bg-blue-50 p-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-700">
                    This rigorous standard is your assurance that when you choose a Preferred Provider, your care is already optimized for the best possible outcome.
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