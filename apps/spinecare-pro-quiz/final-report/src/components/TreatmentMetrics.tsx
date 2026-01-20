
import React from 'react';
import { Badge } from './ui/badge';
import { Target, Clock, MapPin, User } from 'lucide-react';

const TreatmentMetrics = () => {
  return (
    <div className="w-full py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-2xl font-bold text-black mb-4 text-center">
          Estimated Treatment Metrics
        </h2>
        
        {/* Patient name with icon */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-teal-primary rounded-full p-2 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-teal-primary font-medium text-sm">Sarah Johnson</span>
        </div>
        
        {/* Clear container with responsive layout */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left column - Gray circle with image and knee tag */}
          <div className="flex-1 flex flex-col items-center mt-4 lg:mt-8">
            <div className="relative">
              {/* Background square with light teal gradient - responsive sizing */}
              <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-teal-primary/10 to-teal-secondary/5 rounded-3xl absolute inset-0 -top-6 -left-6 lg:-top-8 lg:-left-8"></div>
              
              {/* Image with rounded corners on top - responsive sizing */}
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/ad0f01ca-8029-4e90-560c-791e9f07e300/public"
                alt="Treatment illustration"
                className="w-60 h-60 sm:w-68 sm:h-68 lg:w-80 lg:h-80 object-cover rounded-2xl shadow-lg relative z-10"
              />
            </div>
            
            {/* Tags underneath */}
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              <Badge 
                className="bg-gray-600 text-white px-3 py-1 text-sm font-medium hover:bg-gray-700"
              >
                LOW BACK PAIN
              </Badge>
              <Badge 
                className="bg-gray-600 text-white px-3 py-1 text-sm font-medium hover:bg-gray-700"
              >
                RADICULOPATHY
              </Badge>
            </div>
          </div>

          {/* Right column - Stacked rectangles */}
          <div className="flex-1 space-y-6 w-full lg:w-auto">
            {/* Rectangle 1 - Estimated Results */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4">
                {/* Teal circle with icon */}
                <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                
                {/* Text content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Estimated Recovery Time</h3>
                  <p className="text-sm text-gray-600">6 to 8 weeks. Treatment frequency will be recommended by the provider pending in-person evaluation.</p>
                </div>
              </div>
            </div>

            {/* Rectangle 2 - Treatment Time */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4">
                {/* Teal circle with icon */}
                <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                
                {/* Text content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Therapy Session Time</h3>
                  <p className="text-sm text-gray-600">30 to 40 minutes each - no downtime necessary</p>
                </div>
              </div>
            </div>

            {/* Rectangle 3 - Travel Distance */}
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4">
                {/* Teal circle with icon */}
                <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                
                {/* Text content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Travel Distance</h3>
                  <p className="text-sm text-gray-600">Preferred provider located near Alpharetta, Georgia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentMetrics;
