
import React, { useRef, useEffect, useState } from 'react';
import { Armchair, User, Footprints, Package, Car } from 'lucide-react';
import { Badge } from './ui/badge';
import patientAnatomy from '../assets/patient-anatomy.png';

const ActivityImprovement = () => {
  const [isVisible, setIsVisible] = useState(false);
  const barGraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    );

    if (barGraphRef.current) {
      observer.observe(barGraphRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full" style={{ backgroundColor: '#F2FAFA' }}>
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Gray container */}
        <div className="rounded-lg p-8 shadow-lg relative" style={{ backgroundColor: '#e1ecf2' }}>
          {/* Potential Mobility Improvement - Positioned to the right of chart */}
          <div className="absolute top-14 left-1/2 transform translate-x-36 z-10">
            <div className="flex items-center gap-2">
              <span className="text-gray-800 text-sm font-medium">Potential mobility improvement:</span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg text-xs">
                Good
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Left column - Bar Graph */}
            <div className="flex-1">
              <div className="bg-white rounded-lg p-6 shadow-lg" ref={barGraphRef} style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))' }}>
                <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: '#309bb3' }}>
                  Estimated Mobility Improvement
                </h3>
                <div className="h-64 flex items-end justify-center gap-4 relative">
                  {/* Y-axis line */}
                  <div className="absolute left-12 top-4 bottom-12 w-px bg-gray-300"></div>
                  
                  {/* X-axis line */}
                  <div className="absolute left-12 bottom-12 right-4 h-px bg-gray-300"></div>
                  
                  {/* Y-axis label */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
                    <span className="text-sm font-medium text-gray-600">Improvement</span>
                  </div>
                  
                  {/* Animated bars */}
                  <div className="flex items-end gap-3 h-full pt-8 pl-8 pb-12">
                    <div className={`w-12 rounded-t ${isVisible ? 'animated-bar bar-1' : 'h-0'}`} style={{ backgroundColor: '#B6D8EA' }}></div>
                    <div className={`w-12 rounded-t ${isVisible ? 'animated-bar bar-2' : 'h-0'}`} style={{ backgroundColor: '#F2D28E' }}></div>
                    <div className={`w-12 rounded-t ${isVisible ? 'animated-bar bar-3' : 'h-0'}`} style={{ backgroundColor: '#FFB170' }}></div>
                    <div className={`w-12 rounded-t ${isVisible ? 'animated-bar bar-4' : 'h-0'}`} style={{ backgroundColor: '#FF7F5E' }}></div>
                    <div className={`w-12 rounded-t ${isVisible ? 'animated-bar bar-5' : 'h-0'}`} style={{ backgroundColor: '#2ea0bf' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Activity Icons */}
            <div className="w-72 space-y-4 relative">
              {/* Sitting */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B6D8EA' }}>
                  <Armchair size={16} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">Sitting</span>
              </div>

              {/* Standing */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F2D28E' }}>
                  <User size={16} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">Standing</span>
              </div>

              {/* Walking */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFB170' }}>
                  <Footprints size={16} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">Walking</span>
              </div>

              {/* Bending / Lifting */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF7F5E' }}>
                  <Package size={16} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">Bending / Lifting</span>
              </div>

              {/* Driving */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2ea0bf' }}>
                  <Car size={16} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">Driving</span>
              </div>
              
              {/* Dividing line positioned right after the icon text */}
              <div className="absolute top-1/2 transform -translate-y-1/2 w-px bg-gray-300" style={{ height: '200px', left: '220px' }}></div>
            </div>


            {/* Right side - Patient Image */}
            <div className="flex-shrink-0">
              <img 
                src={patientAnatomy} 
                alt="Patient anatomy diagram" 
                className="h-64 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityImprovement;
