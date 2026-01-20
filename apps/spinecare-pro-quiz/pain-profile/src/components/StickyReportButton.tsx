
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleArrowRight } from 'lucide-react';

const StickyReportButton = () => {
  const handleGenerateReport = () => {
    console.log('Generate Report Now clicked');
    // Navigation logic will be added later
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:pb-8 mt-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          onClick={handleGenerateReport}
          className="w-full md:w-auto md:mx-auto md:block bg-[#fa684b] hover:bg-[#e55d43] text-white font-semibold py-4 md:py-3 md:px-8 text-lg md:text-base md:flex md:items-center md:justify-center md:gap-2"
        >
          Generate Report Now
          <CircleArrowRight size={20} className="hidden md:inline-block" />
        </Button>
      </div>
    </div>
  );
};

export default StickyReportButton;
