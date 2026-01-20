
import React, { useState, useEffect } from 'react';
import { Info, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import betterJointLogo from '@/src/assets/better-joint-logo.png';

interface HeaderProps {
  score?: number;
  patientName?: string;
  joint?: string;
  outlook?: string;
  chartData?: Array<{ name: string; value: number }>;
}

const Header = ({ score = 86, patientName = "Sarah Johnson", joint = "Low Back Pain & Radiculopathy", outlook = "Good", chartData = [] }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      <div className={`w-full py-4 px-6 border-b transition-all duration-300 ${isScrolled ? 'bg-white shadow-md border-gray-100' : 'bg-white/20 backdrop-blur-md border-white/30'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/524b7454-9d10-42b6-5581-8c3056809000/public"
              alt="Better Joint"
              className="h-8 lg:h-10 w-auto"
            />
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-teal-primary/60 uppercase tracking-[0.2em]">Treatment Report</p>
            <p className="text-xs font-black text-gray-800 uppercase tracking-widest">{patientName}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
