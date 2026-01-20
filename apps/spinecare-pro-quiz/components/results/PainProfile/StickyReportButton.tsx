
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleArrowRight } from 'lucide-react';
import { useQuiz } from '../../../context/QuizContext';

const StickyReportButton = () => {
  const { nextQuestion } = useQuiz();

  const handleGenerateReport = () => {
    nextQuestion();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] p-4 pb-6 md:pb-8">
      <div className="max-w-6xl mx-auto flex justify-center">
        <Button 
          onClick={handleGenerateReport}
          className="w-full sm:w-auto bg-[#fa684b] hover:bg-[#e55d43] text-white font-black py-6 px-12 rounded-full text-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          Generate Report Now
          <CircleArrowRight size={24} />
        </Button>
      </div>
    </div>
  );
};

export default StickyReportButton;
