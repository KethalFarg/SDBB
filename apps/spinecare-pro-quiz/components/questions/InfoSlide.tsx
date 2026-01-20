
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QuestionConfig } from '../../types';
import { useQuiz } from '../../context/QuizContext';
import { ArrowRight } from 'lucide-react';
import { InfoBackgroundSVG } from '../ui/InfoBackgroundSVG';

interface Props {
  config: QuestionConfig;
}

export const InfoSlide: React.FC<Props> = ({ config }) => {
  const { nextQuestion } = useQuiz();
  // Default to dark theme for this flow per requirements unless specified light
  const isLight = config.theme === 'light';
  const isMcClure = config.componentProps?.variant === 'mcclure-chart';

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isMcClure) {
      setTimeout(() => setProgress(89), 300);
    }
  }, [isMcClure]);

  return (
    <div className={`relative flex flex-col min-h-full ${isLight ? 'text-brand-dark' : 'text-white'}`}>

      {/* Animated Background */}
      {/* Animated Background - Portal to Body to break out of containers */}
      {!isLight && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[5] pointer-events-none">
          <InfoBackgroundSVG />
        </div>,
        document.body
      )}

      {/* Content wrapper with z-index to sit above background */}
      <div className="flex flex-col flex-1 z-10 relative">

        {/* Content Area - Headline (Title) First */}
        <div className="flex flex-col items-center text-center justify-center px-4 pt-4 sm:pt-6 pb-2 sm:pb-4">
          {!config.componentProps?.image && !isMcClure && !config.componentProps?.VisualComponent && (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6 backdrop-blur-sm shadow-md bg-white/10 text-brand-lightTeal">
              <span className="text-2xl sm:text-3xl">💡</span>
            </div>
          )}

          <h2 className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight ${isLight ? 'text-brand-dark' : 'text-white'}`}>
            {config.question}
          </h2>
          {config.componentProps?.headlineSubtext && (
            <p className={`mt-2 sm:mt-3 text-base sm:text-lg font-bold uppercase tracking-widest opacity-80 max-w-lg mx-auto ${isLight ? 'text-brand-teal' : 'text-brand-lightTeal'}`}>
              {config.componentProps.headlineSubtext}
            </p>
          )}
        </div>

        {/* Visual Area */}
        {config.componentProps?.VisualComponent ? (
          <div className="w-full h-32 sm:h-48 md:h-64 mb-4 sm:mb-6 flex items-center justify-center p-4">
            <config.componentProps.VisualComponent className="w-full h-full text-brand-lightTeal opacity-90" />
          </div>
        ) : config.componentProps?.image && (
          <div className="w-full h-40 sm:h-48 md:h-64 mb-4 sm:mb-6 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 relative bg-gray-900 border border-white/10">
            <img
              src={config.componentProps.image}
              alt="Insight"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
          </div>
        )}

        {/* McClure Chart Variant */}
        {isMcClure && (
          <div className="flex items-center justify-center mb-6 sm:mb-10 py-4 sm:py-6">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="72" className="stroke-white/10 fill-none" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="72"
                  className="stroke-brand-lightTeal fill-none transition-all duration-[2000ms] ease-out"
                  strokeWidth="10"
                  strokeDasharray={452}
                  strokeDashoffset={452 - (452 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-white">{progress}%</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Improvement</span>
              </div>
            </div>
          </div>
        )}

        {/* Subtext Area */}
        <div className="flex-1 flex flex-col items-center text-center px-4">
          <p className={`text-base sm:text-lg font-medium leading-relaxed mb-4 sm:mb-6 max-w-md whitespace-pre-line ${isLight ? 'text-gray-600' : 'text-white/80'}`}>
            {config.subtext}
          </p>

          {config.componentProps?.highlightedSubtext && (
            <div className={`w-full max-w-md border rounded-2xl p-4 sm:p-6 mb-4 text-center relative overflow-hidden ${config.componentProps.highlightedSubtextBg || 'bg-white/5 backdrop-blur-md shadow-xl'} ${config.componentProps.highlightedSubtextBorder || 'border-white/10'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lightTeal/30 to-transparent"></div>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {config.componentProps.highlightedSubtext}
              </p>
            </div>
          )}

          {isMcClure && (
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/30 max-w-xs mx-auto pb-4">
              Patient-reported outcomes. Results vary. Evaluation required.
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-auto pt-4 sm:pt-6 w-full flex justify-center pb-6 sm:pb-8">
          <button
            onClick={nextQuestion}
            className="px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 bg-[#fa684b] text-white border-2 border-white/20 hover:bg-[#e55d43] hover:shadow-[#fa684b]/20"
          >
            Continue <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
