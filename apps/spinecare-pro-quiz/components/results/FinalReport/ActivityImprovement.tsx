
import React, { useRef, useEffect, useState } from 'react';
import { Armchair, User, Footprints, Package, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import patientAnatomy from '@/src/assets/patient-anatomy.png';

interface ActivityImprovementProps {
  patientName?: string;
}

const ActivityImprovement = ({ patientName = "Sarah Johnson" }: ActivityImprovementProps) => {
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
    <div className="w-full bg-[#F2FAFA] py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Gray container */}
        <div className="rounded-3xl p-6 lg:p-8 shadow-lg relative bg-[#e1ecf2]">
          {/* Potential Mobility Improvement - Positioned to the right of chart on desktop */}
          <div className="lg:absolute lg:top-14 lg:left-1/2 lg:transform lg:translate-x-36 z-10 mb-6 lg:mb-0 flex justify-center lg:block">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm">
              <span className="text-gray-800 text-xs lg:text-sm font-bold uppercase tracking-tight">Potential mobility improvement:</span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg text-[10px] lg:text-xs">
                Good
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left column - Bar Graph */}
            <div className="w-full lg:flex-1">
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-xl" ref={barGraphRef}>
                <h3 className="text-base lg:text-lg font-black mb-6 text-center uppercase tracking-tight" style={{ color: '#309bb3' }}>
                  Estimated Mobility Improvement
                </h3>
                <div className="h-64 flex items-end justify-center gap-2 sm:gap-4 relative">
                  {/* Y-axis line */}
                  <div className="absolute left-8 lg:left-12 top-4 bottom-12 w-px bg-gray-200"></div>

                  {/* X-axis line */}
                  <div className="absolute left-8 lg:left-12 bottom-12 right-4 h-px bg-gray-200"></div>

                  {/* Y-axis label */}
                  <div className="absolute -left-6 lg:-left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
                    <span className="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest">Improvement</span>
                  </div>

                  {/* Animated bars */}
                  <div className="flex items-end gap-2 lg:gap-3 h-full pt-8 pl-8 lg:pl-12 pb-12 overflow-hidden">
                    <div className={`w-8 lg:w-12 rounded-t transition-all duration-1000 ease-out ${isVisible ? 'h-[40%]' : 'h-0'}`} style={{ backgroundColor: '#B6D8EA' }}></div>
                    <div className={`w-8 lg:w-12 rounded-t transition-all duration-1000 ease-out delay-100 ${isVisible ? 'h-[55%]' : 'h-0'}`} style={{ backgroundColor: '#F2D28E' }}></div>
                    <div className={`w-8 lg:w-12 rounded-t transition-all duration-1000 ease-out delay-200 ${isVisible ? 'h-[70%]' : 'h-0'}`} style={{ backgroundColor: '#FFB170' }}></div>
                    <div className={`w-8 lg:w-12 rounded-t transition-all duration-1000 ease-out delay-300 ${isVisible ? 'h-[85%]' : 'h-0'}`} style={{ backgroundColor: '#FF7F5E' }}></div>
                    <div className={`w-8 lg:w-12 rounded-t transition-all duration-1000 ease-out delay-400 ${isVisible ? 'h-[90%]' : 'h-0'}`} style={{ backgroundColor: '#2ea0bf' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Activity Icons */}
            <div className="w-full lg:w-64 space-y-3 relative grid grid-cols-2 lg:block gap-2">
              {[
                { icon: Armchair, label: "Sitting", color: '#B6D8EA' },
                { icon: User, label: "Standing", color: '#F2D28E' },
                { icon: Footprints, label: "Walking", color: '#FFB170' },
                { icon: Package, label: "Bending / Lifting", color: '#FF7F5E' },
                { icon: Car, label: "Driving", color: '#2ea0bf' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/30 backdrop-blur-sm p-2 rounded-lg lg:bg-transparent lg:p-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: item.color }}>
                    <item.icon size={14} className="text-white" />
                  </div>
                  <span className="text-gray-700 font-bold text-[10px] lg:text-sm uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Right side - Patient Image */}
            <div className="hidden lg:block flex-shrink-0">
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
