
import React from 'react';
import { Button } from '@/components/ui/button';

const StickyBottomSection = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Black glass wrapper */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex justify-center">
          <Button 
            className="bg-[#fa684b] text-white hover:bg-[#e55a41] font-semibold px-6 py-3 text-base lg:px-8 lg:text-lg w-full max-w-sm lg:max-w-none lg:w-auto"
            size="lg"
          >
            Schedule Trial Treatment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomSection;
