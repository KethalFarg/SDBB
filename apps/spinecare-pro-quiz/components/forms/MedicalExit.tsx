
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

export const MedicalExit: React.FC = () => {
  // Logic to perhaps reset quiz or redirect
  // For now, just a display screen
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
            <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Please Seek Medical Attention</h2>
        <p className="text-white/80 leading-relaxed max-w-md mb-8">
            Loss of bladder or bowel control can be a sign of a serious condition called Cauda Equina Syndrome. 
            We recommend you seek immediate evaluation at an urgent care or emergency room to be safe.
        </p>
        <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
            Back to Start
        </button>
    </div>
  );
};
