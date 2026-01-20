
import React, { useState } from 'react';
import { QuestionConfig } from '../../types';
import { useQuiz } from '../../context/QuizContext';
import { ArrowRight, Check } from 'lucide-react';

const SHADOW_LIGHT = '5px 5px 10px rgba(1, 75, 92, 0.6), -4px -4px 8px rgba(255, 255, 255, 1)';
const SHADOW_PRESSED = 'inset 4px 4px 8px rgba(1, 75, 92, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)';

interface Props {
  config: QuestionConfig;
}

export const TileGrid: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const initialSelected = (state.answers[config.id as keyof typeof state.answers] as string[]) || [];
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const isLight = config.theme === 'light';

  const toggleSelect = (value: string) => {
    let newSelected;
    if (config.multiSelect) {
      if (selected.includes(value)) {
        newSelected = selected.filter(v => v !== value);
      } else {
        if (config.maxSelections && selected.length >= config.maxSelections) {
          newSelected = [...selected.slice(0, config.maxSelections - 1), value];
        } else {
          newSelected = [...selected, value];
        }
      }
    } else {
      newSelected = [value];
    }
    setSelected(newSelected);
    handleAnswer(config.id as any, newSelected); // Update state immediately for the global button
  };

  // If single select, auto advance slightly delayed
  const handleSingleSelect = (val: string) => {
    const updatedAnswers = { ...state.answers, [config.id as string]: val };
    handleAnswer(config.id as any, val);
    setTimeout(() => nextQuestion(updatedAnswers), 200);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-3 w-full">
      {config.options?.map((option) => {
        const isSelected = selected.includes(option.value as string);
        const Icon = option.icon;

        const isMovement = ['movement-triggers', 'treatments-tried', 'mood-impact'].includes(config.id);
        const isDiagnosis = config.id === 'diagnosis';

        return (
          <button
            key={String(option.value)}
            onClick={() => config.multiSelect ? toggleSelect(option.value as string) : handleSingleSelect(option.value as string)}
            style={{
              boxShadow: isLight
                ? (isSelected ? SHADOW_PRESSED : SHADOW_LIGHT)
                : undefined
            }}
            className={`relative flex items-center p-1.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 min-h-[3.8rem] sm:min-h-[7rem] backdrop-blur-sm ${isLight
              ? (isDiagnosis
                ? `bg-white border-[#0590a8] flex-col justify-between hover:bg-[#0590a8]/5 ${isSelected ? 'ring-2 ring-[#0590a8] scale-[0.98]' : ''} sm:aspect-square`
                : (isMovement
                  ? `bg-white border-[#0590a8] flex-col justify-center hover:bg-[#0590a8]/5 ${isSelected ? 'ring-2 ring-[#0590a8] scale-[0.98]' : ''}`
                  : (isSelected
                    ? 'bg-[#0590a8] flex-col justify-center border-[#0590a8] scale-[0.98]'
                    : 'bg-[#0590a8] flex-col justify-center border-transparent hover:bg-[#047c91] hover:scale-[1.02] hover:translate-y-[1px]')))
              : (isSelected
                ? 'bg-brand-teal/20 flex-col justify-center border-brand-teal shadow-[0_0_15px_rgba(2,152,179,0.2)]'
                : 'bg-white/5 flex-col justify-center border-transparent hover:bg-white/10 hover:border-white/10 shadow-md')
              }`}
          >
            {config.multiSelect && isSelected && (
              <div className={`absolute top-2 right-2 z-10 rounded-full p-0.5 ${isLight ? 'bg-[#0590a8]' : 'bg-brand-teal'}`}>
                <Check size={12} className="text-white" />
              </div>
            )}

            {isDiagnosis ? (
              <>
                {(option.image || Icon) && (
                  <div className="w-full aspect-[2.4/1] sm:aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 mb-0.5 sm:mb-3 flex items-center justify-center bg-transparent sm:bg-white">
                    {option.image ? (
                      <img src={option.image} alt={option.label} className="w-full h-full object-contain" />
                    ) : (
                      Icon && <Icon className={`w-full h-full text-[#0590a8] ${option.value === 'Not sure / Other / None' ? 'scale-[0.5] sm:scale-100' : 'scale-[0.85] sm:scale-150'}`} />
                    )}
                  </div>
                )}
                <span className="text-[13.5px] sm:text-sm font-bold text-[#0590a8] text-center w-full leading-[1.1] px-0.5">{option.label}</span>
              </>
            ) : (
              <>
                {Icon && (
                  isMovement ? (
                    <Icon size={40} className="mb-4 text-[#0590a8]" strokeWidth={2.5} />
                  ) : (
                    <Icon size={28} className={`mb-3 ${isLight ? 'text-white' : (isSelected ? 'text-brand-lightTeal' : 'text-white/60')}`} />
                  )
                )}
                <span className={`text-sm font-bold text-center leading-tight ${isLight ? (isMovement ? 'text-[#0590a8]' : 'text-white') : (isSelected ? 'text-white' : 'text-white/80')}`}>
                  {option.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};
