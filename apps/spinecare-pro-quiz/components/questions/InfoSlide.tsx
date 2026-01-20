
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QuestionConfig } from '../../types';
import { InfoBackgroundSVG } from '../ui/InfoBackgroundSVG';

interface Props {
  config: QuestionConfig;
}

export const InfoSlide: React.FC<Props> = ({ config }) => {
  const isLight = config.theme === 'light';
  const isMcClure = config.componentProps?.variant === 'mcclure-chart';

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isMcClure) {
      setTimeout(() => setProgress(89), 300);
    }
  }, [isMcClure]);

  return (
    <div className={`relative flex flex-col h-full ${isLight ? 'text-brand-dark' : 'text-white'}`}>

      {/* Animated Background - Portal to Body */}
      {!isLight && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[5] pointer-events-none">
          <InfoBackgroundSVG />
        </div>,
        document.body
      )}

      {/* Main Content - Scrollable with proper spacing */}
      <div className="flex flex-col z-10 relative flex-1 overflow-y-auto">
        
        {/* Headline - At the top, using header space */}
        <div className="text-center px-4 pt-2 pb-4 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold leading-tight ${isLight ? 'text-brand-dark' : 'text-white'}`}>
            {config.question}
          </h2>
        </div>

        {/* Visual Area */}
        <div className="flex-shrink-0">
          {config.componentProps?.VisualComponent ? (
            <div className="w-full mb-3 flex items-center justify-center px-2">
              <div className="w-full max-w-sm">
                <config.componentProps.VisualComponent className="w-full h-auto text-brand-lightTeal opacity-95" />
              </div>
            </div>
          ) : config.componentProps?.image && (
            <div className="w-full mb-3 px-4 flex justify-center">
              <div className="w-full max-w-[280px] sm:max-w-xs rounded-xl overflow-hidden shadow-lg bg-gray-900/50 border border-white/10">
                <img
                  src={config.componentProps.image}
                  alt="Insight"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* McClure Chart Variant */}
          {isMcClure && (
            <div className="flex items-center justify-center mb-4 py-2">
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" className="stroke-white/10 fill-none" strokeWidth="8" />
                  <circle
                    cx="64" cy="64" r="58"
                    className="stroke-brand-lightTeal fill-none transition-all duration-[2000ms] ease-out"
                    strokeWidth="8"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-black text-white">{progress}%</span>
                  <span className="text-[7px] sm:text-[10px] font-medium tracking-wider text-white/60 mt-0.5">IMPROVEMENT</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtext Area - Compact */}
        <div className="flex flex-col items-center text-center px-4 pb-4">
          <p className={`text-sm sm:text-base font-medium leading-relaxed mb-3 max-w-md whitespace-pre-line ${isLight ? 'text-gray-600' : 'text-white/80'}`}>
            {config.subtext}
          </p>

          {config.componentProps?.highlightedSubtext && (
            <div className={`w-full max-w-md border rounded-xl p-3 sm:p-4 text-center relative overflow-hidden ${config.componentProps.highlightedSubtextBg || 'bg-white/5 backdrop-blur-md'} ${config.componentProps.highlightedSubtextBorder || 'border-white/20'}`}>
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {config.componentProps.highlightedSubtext}
              </p>
            </div>
          )}

          {isMcClure && (
            <p className="text-[9px] sm:text-[10px] font-medium tracking-wider text-white/30 max-w-xs mx-auto mt-3">
              Patient-reported outcomes. Results vary. Evaluation required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
