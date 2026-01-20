import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { PROGRESS_SECTIONS, QUIZ_CONFIG } from '../../constants';

export const Header: React.FC = () => {
  const { prevQuestion, state, getCurrentSection, getQuestionIndex } = useQuiz();
  const currentSectionId = getCurrentSection();
  const { current, total } = getQuestionIndex();

  const config = QUIZ_CONFIG.find(q => q.id === state.currentStepId);
  const isLight = config?.theme === 'light';

  // Check if we are in a tracked section
  const isValidSection = PROGRESS_SECTIONS.some(s => s.id === currentSectionId);

  return (
    <div className="absolute top-0 left-0 z-50 w-full pt-6 pb-2 px-6 bg-transparent">
      {/* Top Row: Back | Section Title | Count */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
        {/* Left: Back Button */}
        <button
          onClick={prevQuestion}
          disabled={state.history.length === 0}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all backdrop-blur-sm ${state.history.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Center: Current Section Label (Only if valid section) */}
        <div className="text-center pointer-events-none flex justify-center items-center">
          {isValidSection && config?.type !== 'info-slide' ? (
            <span className={`font-semibold text-lg tracking-wide uppercase opacity-90 ${isLight ? 'text-brand-dark' : 'text-white'}`}>
              {PROGRESS_SECTIONS.find(s => s.id === currentSectionId)?.label || ''}
            </span>
          ) : null}
        </div>

        {/* Right: Counter (Only if valid section and count > 0) */}
        <div className="w-10 flex justify-end">
          {isValidSection && current > 0 && (
            <span className={`font-medium text-sm whitespace-nowrap ${isLight ? 'text-gray-500' : 'text-white/60'}`}>
              Question {current} of {total}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Segmented Progress Bar (Only show if valid section) */}
      {isValidSection && (
        <div className="max-w-2xl mx-auto flex gap-1.5 h-1.5 align-start px-1">
          {PROGRESS_SECTIONS.map((section, idx) => {
            // Determine active state
            const currentIdx = PROGRESS_SECTIONS.findIndex(s => s.id === currentSectionId);
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;

            // Calculate width
            let width = '0%';
            if (isCompleted) {
              width = '100%';
            } else if (isActive && total > 0) {
              // Granular progress for active section
              width = `${Math.min((current / total) * 100, 100)}%`;
            }

            return (
              <div key={section.id} className={`flex-1 rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div
                  className={`h-full transition-all duration-500 ease-out ${isCompleted ? 'bg-brand-teal' : isActive ? 'bg-[#f2654a]' : ''
                    }`}
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};