import React from 'react';
import { QuestionConfig, QuestionOption } from '../../types';
import { useQuiz } from '../../context/QuizContext';
import { User } from 'lucide-react';

const SHADOW_LIGHT = '5px 5px 10px rgba(1, 75, 92, 0.6), -4px -4px 8px rgba(255, 255, 255, 1)';
const SHADOW_PRESSED = 'inset 4px 4px 8px rgba(1, 75, 92, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)';

interface Props {
  config: QuestionConfig;
}

export const PictureTiles: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleSelect = (option: QuestionOption) => {
    const updatedAnswers = { ...state.answers, [config.id as string]: option.value };
    handleAnswer(config.id as any, option.value);
    if (config.autoAdvance) {
      setTimeout(() => nextQuestion(updatedAnswers), 400);
    } else {
      nextQuestion(updatedAnswers);
    }
  };

  const isLightMode = config.theme === 'light';
  // Check if we have 4 options (Age) vs 2 (Gender)
  const isGrid = config.options && config.options.length > 2;

  // Conditional Image Logic
  const getOptionImage = (option: QuestionOption) => {
    if (config.componentProps?.conditionalImages && state.answers.gender) {
      const gender = state.answers.gender.toLowerCase();
      const imageSet = config.componentProps.conditionalImages[gender];
      if (imageSet && imageSet[option.value as string]) {
        return imageSet[option.value as string];
      }
    }
    return option.image;
  };

  return (
    <div className={`grid gap-3 sm:gap-4 w-full max-w-[88%] sm:max-w-xl mx-auto ${isGrid ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
      {config.options?.map((option) => {
        const displayImage = getOptionImage(option);
        const isActive = activeId === String(option.value);

        return (
          <button
            key={String(option.value)}
            onClick={() => handleSelect(option)}
            onMouseDown={() => setActiveId(String(option.value))}
            onMouseUp={() => setActiveId(null)}
            onMouseLeave={() => setActiveId(null)}
            onTouchStart={() => setActiveId(String(option.value))}
            onTouchEnd={() => setActiveId(null)}
            style={{
              boxShadow: isLightMode
                ? (isActive ? SHADOW_PRESSED : SHADOW_LIGHT)
                : undefined
            }}
            className={`
            group relative overflow-hidden rounded-2xl transition-all duration-150 flex flex-col w-full
            ${isLightMode
                ? `bg-white border-2 border-[#0590a8] text-brand-dark ${isActive ? 'scale-[0.98]' : 'hover:translate-y-[1px]'}`
                : 'bg-white/10 border-2 border-transparent hover:border-brand-teal/50 text-white shadow-md hover:shadow-xl hover:-translate-y-1'
              }
          `}
          >
            {/* Image Container */}
            <div className={`w-full relative ${isGrid ? 'aspect-square' : 'aspect-[3/4] md:aspect-[4/3]'} bg-transparent`}>
              {/* Fallback Icon */}
              <div className={`absolute inset-0 flex items-center justify-center ${isLightMode ? 'text-gray-400' : 'text-white/20'}`}>
                <User size={isGrid ? 48 : 64} strokeWidth={1.5} />
              </div>

              {/* Image or Component */}
              {displayImage && (
                typeof displayImage === 'string' ? (
                  <img
                    src={displayImage}
                    alt={option.label}
                    className="absolute inset-0 h-full w-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                    {/* Dynamic component rendering */}
                    {(() => {
                      const VisualComponent = displayImage as React.ElementType;
                      const isAge = config.id === 'age';
                      const isMale = isAge && state.answers.gender === 'male';
                      const isFemale = isAge && state.answers.gender === 'female';

                      let classes = 'w-full h-full object-cover p-0';

                      if (isFemale) {
                        if (option.value === '18-34') {
                          classes += ' scale-[1.26] origin-center translate-y-1';
                        } else if (option.value === '50-64') {
                          classes += ' scale-[1.26] origin-center translate-y-1 translate-x-2';
                        } else if (option.value === '65+') {
                          classes += ' scale-[1.26] origin-center translate-y-1.5';
                        } else {
                          classes += ' scale-[1.26] origin-center';
                        }
                      } else if (isMale) {
                        if (option.value === '18-34') {
                          classes += ' scale-[1.65] origin-center translate-y-3';
                        } else if (option.value === '35-49') {
                          classes += ' scale-[1.65] origin-center translate-y-2';
                        } else if (option.value === '50-64') {
                          classes += ' scale-[1.55] origin-center translate-y-3';
                        } else if (option.value === '65+') {
                          classes += ' scale-[1.55] origin-center translate-y-4';
                        } else {
                          classes += ' scale-[1.55] origin-center';
                        }
                      }

                      return <VisualComponent className={classes} />;
                    })()}
                  </div>
                )
              )}

              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20 pointer-events-none" />
            </div>

            {/* Footer / Label Area */}
            <div className={`w-full py-3 sm:py-4 relative z-30 flex items-center justify-center text-center transition-colors duration-300 ${isLightMode
              ? 'bg-gradient-to-r from-[#0590a8] to-[#036c7e]'
              : 'bg-white/5'
              }`}>
              <span className={`${isGrid ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-white tracking-wide`}>
                {option.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
