
import React from 'react';
import { QuestionConfig } from '../../types';
import { useQuiz } from '../../context/QuizContext';
const SHADOW_LIGHT = '5px 5px 10px rgba(1, 75, 92, 0.6), -4px -4px 8px rgba(255, 255, 255, 1)';
const SHADOW_PRESSED = 'inset 4px 4px 8px rgba(1, 75, 92, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)';

interface Props {
  config: QuestionConfig;
}

export const SplitImageOptions: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();

  const handleSelect = (val: string) => {
    const updatedAnswers = { ...state.answers, [config.id as string]: val };
    handleAnswer(config.id as any, val);
    if (config.autoAdvance) setTimeout(() => nextQuestion(updatedAnswers), 300);
    else nextQuestion(updatedAnswers);
  };

  const { image, reverse } = config.componentProps || {};
  const isLight = config.theme === 'light';

  return (
    <div className={`flex ${reverse ? 'flex-row-reverse' : 'flex-row'} gap-4 sm:gap-8 w-full items-center justify-center max-w-5xl mx-auto px-2 sm:px-4`}>
      {/* Image Side - Shrink on mobile to allow side-by-side */}
      <div className="w-4/12 md:w-5/12 flex justify-center items-center">
        <div className="relative w-full overflow-visible">
          {config.id === 'duration' ? (
            <div className="w-full flex justify-center py-4">
              <img
                src="/watch.svg"
                alt="Duration Watch"
                className="w-auto h-full max-h-[30vh] md:max-h-[50vh] object-contain scale-[1.5] md:scale-[2.5]"
              />
            </div>
          ) : (
            image && (
              <img
                src={image}
                alt="Visual"
                className="w-full h-auto object-contain max-h-[35vh] md:max-h-[55vh]"
              />
            )
          )}
        </div>
      </div>

      {/* Buttons Side - Side-by-side on mobile */}
      <div className="w-8/12 md:w-7/12 flex flex-col justify-center gap-2 sm:gap-4">
        {config.options?.map((option) => (
          <button
            key={String(option.value)}
            onClick={() => handleSelect(String(option.value))}
            style={{
              boxShadow: isLight
                ? SHADOW_LIGHT
                : undefined
            }}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-[13.5px] sm:text-lg transition-all active:scale-[0.98] text-center backdrop-blur-sm border-2 ${isLight
              ? 'bg-white text-[#0590a8] border-[#0590a8] hover:bg-[#0590a8]/5'
              : 'bg-white/10 hover:bg-white/20 border-white/5 hover:border-brand-teal/50 text-white shadow-lg'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
