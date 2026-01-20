
import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Check, Loader2 } from 'lucide-react';

interface LoadingSlideProps {
  variant?: 'default' | 'mcclure';
}

export const LoadingSlide: React.FC<LoadingSlideProps> = ({ variant = 'default' }) => {
  const { nextQuestion, state } = useQuiz();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Get current config to check for variant in componentProps
  const currentConfig = state.currentStepId;
  const isMcClure = variant === 'mcclure';

  const defaultSteps = [
    "Comparing your answers with clinical patterns...",
    "Analyzing mobility and nerve pressure risk...",
    "Generating personalized recommendations..."
  ];

  const steps = isMcClure ? [] : defaultSteps;

  useEffect(() => {
    if (isMcClure) {
      // McClure variant: Simple animation then auto-advance
      setTimeout(() => setProgress(89), 300);
      const timer = setTimeout(() => {
        nextQuestion();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      // Default variant: Multi-step loading
      const t1 = setTimeout(() => setStep(1), 2000);
      const t2 = setTimeout(() => setStep(2), 4000);
      const t3 = setTimeout(() => {
        setTimeout(nextQuestion, 800);
      }, 6500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [nextQuestion, isMcClure]);

  if (isMcClure) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6">
        {/* McClure Chart */}
        <div className="flex items-center justify-center mb-10 py-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-white/10 fill-none" strokeWidth="12" />
              <circle
                cx="96" cy="96" r="88"
                className="stroke-brand-lightTeal fill-none transition-all duration-[2000ms] ease-out"
                strokeWidth="12"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">{progress}%</span>
              <span className="text-xs text-white/60 mt-1">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* McClure Study Text */}
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg text-white/90 leading-relaxed">
            Patients in a published decompression follow-up study reported high satisfaction — around 89% — after completing their treatment program.
          </p>
          <p className="text-sm text-white/70 italic">
            "These results are especially encouraging considering surgery was the next recommended step for most of these patients."
          </p>
          <p className="text-sm text-white/70">
            — McClure, MD (400+ patients)
          </p>
          <p className="text-xs text-white/40 mt-6">
            *These are patient-reported outcomes at 12-month follow-up. Results vary. Final candidacy always requires an in-person evaluation.
          </p>
        </div>
      </div>
    );
  }

  // Default loading variant
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-brand-teal/30 blur-xl rounded-full animate-pulse-slow"></div>
        <Loader2 size={64} className="text-brand-teal animate-spin relative z-10" />
      </div>

      <div className="w-full max-w-md space-y-6 px-6">
        {steps.map((text, idx) => {
          const isActive = step === idx;
          const isComplete = step > idx;

          return (
            <div key={idx} className="flex items-center gap-4 transition-all duration-500">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${isComplete ? 'bg-green-500 border-green-500' :
                  isActive ? 'border-brand-teal animate-pulse' : 'border-white/10'
                }`}>
                {isComplete && <Check size={16} className="text-white" />}
              </div>

              <div className="flex-1">
                <p className={`text-lg font-medium transition-colors ${isActive ? 'text-white' : isComplete ? 'text-white/60' : 'text-white/20'}`}>
                  {text}
                </p>
                {isActive && (
                  <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-teal animate-[width_2s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

