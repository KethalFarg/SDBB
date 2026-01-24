import React, { useState } from 'react';
import { QuestionConfig, QuestionOption } from '../../types';
import { useQuiz } from '../../context/QuizContext';
import { ArrowRight, Check, X, DollarSign, Shield, ThumbsUp, Clock } from 'lucide-react';

const SHADOW_LIGHT = '5px 5px 10px rgba(1, 75, 92, 0.6), -4px -4px 8px rgba(255, 255, 255, 1)';
const SHADOW_PRESSED = 'inset 4px 4px 8px rgba(1, 75, 92, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)';

interface Props {
  config: QuestionConfig;
}

export const FullButtons: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const isLight = config.theme === 'light';

  // Handle dynamic options from previous answers (Q4: primary-region)
  let options = config.options || [];
  if (config.componentProps?.dynamicFromPrevious) {
    const prevKey = config.componentProps.dynamicFromPrevious;
    const prevValues = state.answers[prevKey];
    if (prevValues && Array.isArray(prevValues)) {
      options = prevValues.map((val: string) => ({ value: val, label: val }));
    }
  }

  // Handle Q4b: pain-origin dynamic options
  if (config.id === 'pain-origin') {
    const regions = state.answers['pain-regions'] || [];
    const hasArm = regions.includes('Arm / Shoulder');
    const hasNeck = regions.includes('Neck');
    // If Arm logic activated (Arm AND !Neck)
    if (hasArm && !hasNeck) {
      options = [
        { value: 'Mostly my neck', label: 'Mostly my neck' }, // Spine origin
        { value: 'Mostly my shoulder', label: 'Mostly my shoulder' }, // Non-spine
        { value: 'Not sure', label: 'Not sure' }
      ];
    } else {
      // Default to Leg logic (Buttock/Leg AND !Back)
      options = [
        { value: 'Mostly my lower back', label: 'Mostly my lower back' }, // Spine origin
        { value: 'Mostly my hip or leg', label: 'Mostly my hip or leg' }, // Non-spine
        { value: 'Not sure', label: 'Not sure' }
      ];
    }
  }

  const handleSelect = (val: any) => {
    const updatedAnswers = { ...state.answers, [config.id as string]: val };
    handleAnswer(config.id as any, val);

    if (config.autoAdvance) {
      setTimeout(() => nextQuestion(updatedAnswers), 300);
    } else {
      nextQuestion(updatedAnswers);
    }
  };

  return (
    <div className={`w-full overflow-visible relative z-10 ${config.componentProps?.gridLayout ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}>
      {config.componentProps?.VisualComponent ? (
        <div className={`w-full flex justify-center py-0 mb-0 sm:py-2 sm:mb-2 ${config.componentProps?.gridLayout ? 'col-span-2' : ''}`}>
          <config.componentProps.VisualComponent className="w-full h-48 md:h-72 object-contain text-[#0590a8]" />
        </div>
      ) : config.componentProps?.showLifeImage && (
        <div className="w-[140%] relative left-1/2 -translate-x-1/2 -mt-20 -mb-4 pointer-events-none select-none"
          style={{ maskImage: 'radial-gradient(ellipse at center top, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center top, black 50%, transparent 100%)' }}>
          <img src="/life.svg" alt="Life" className="w-full h-auto opacity-80" />
        </div>
      )}
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={String(opt.value)}
            onClick={() => handleSelect(opt.value)}
            style={{
              boxShadow: isLight
                ? SHADOW_LIGHT
                : undefined
            }}
            className={`w-full py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-sm ${isLight
              ? 'bg-white border-[#0590a8] border-2 text-[#0590a8] font-bold hover:bg-[#0590a8]/5'
              : 'bg-white/10 hover:bg-white/20 border-white/5 hover:border-brand-teal/50 text-white font-medium shadow-lg'
              }`}
          >
            {Icon && <Icon size={20} className={isLight ? 'text-[#0590a8]' : 'text-brand-lightTeal'} />}
            <span className="text-lg">{opt.label}</span>
          </button>
        )
      })}
    </div>
  );
};

export const YesNo: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const isLight = config.theme === 'light';

  // Handle conditional questions (Q5: radiating-pain)
  let questionText = config.question || '';
  if (config.componentProps?.conditionalQuestion && config.componentProps?.questions) {
    const primaryRegion = state.answers.primary_region || '';
    const questions = config.componentProps.questions;

    // Check for "Softened" Logic from Q4b (pain-origin)
    const originAnswer = state.answers['pain-origin'];
    const isNonSpineOrigin = originAnswer === 'Mostly my shoulder' || originAnswer === 'Mostly my hip or leg';

    if (isNonSpineOrigin && questions['softened']) {
      questionText = questions['softened'];
    } else {
      questionText = questions[primaryRegion] || questions['default'] || questionText;
    }
  }

  const handleSelect = (option: QuestionOption) => {
    const updatedAnswers = { ...state.answers, [config.id as string]: option.value };
    handleAnswer(config.id as any, option.value);
    setTimeout(() => nextQuestion(updatedAnswers), 300);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      {/* Dynamic Question Header for Yes/No (since it's not in the central config) */}
      {(questionText || config.question) && (
        <div className="text-center mb-1 sm:mb-2 flex-shrink-0">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-snug ${isLight ? 'text-brand-dark' : 'text-white drop-shadow-md'}`}>
            {questionText || config.question}
          </h1>
        </div>
      )}

      {config.componentProps?.VisualComponent && (
        <div className="w-full flex justify-center py-0 sm:py-1">
          <config.componentProps.VisualComponent className="w-full h-auto max-h-36 sm:max-h-48 text-[#0590a8]" />
        </div>
      )}

      {config.componentProps?.image && (
        <div className="w-full flex justify-center py-2">
          <img
            src={config.componentProps.image}
            alt="Reference"
            className="w-[80%] h-auto max-h-60 object-contain rounded-xl shadow-sm"
          />
        </div>
      )}

      <div className="flex gap-4 h-36 w-full">
        {config.options?.map((opt) => {
          const isYes = opt.label === 'Yes';
          const Icon = isYes ? Check : X; // Enforce specific icons

          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt)}
              style={{
                boxShadow: isLight
                  ? SHADOW_LIGHT
                  : undefined
              }}
              className={`flex-1 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm bg-white border-[#0590a8] text-[#0590a8] hover:bg-[#0590a8]/5 shadow-lg`}
            >
              <Icon size={40} strokeWidth={3} />
              <span className="text-xl font-bold">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TextInput: React.FC<Props> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const [val, setVal] = useState(state.answers[config.id as keyof typeof state.answers] as string || '');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLight = config.theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.validation && !config.validation(val)) {
      setError(true);
      return;
    }

    setLoading(true);
    // Simulate API search
    setTimeout(() => {
      handleAnswer(config.id as any, val);
      nextQuestion();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-center">
      <div className="w-full relative max-w-sm">
        <input
          type="tel"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setError(false);
          }}
          placeholder={config.componentProps?.placeholder || "12345"}
          className={`w-full text-center text-3xl font-bold border-2 rounded-2xl py-5 focus:outline-none transition-colors shadow-inner ${isLight
            ? `bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-[#0590a8] ${error ? 'border-red-500' : 'border-gray-200'}`
            : `bg-white/10 text-white placeholder:text-white/20 focus:border-brand-teal ${error ? 'border-brand-coral' : 'border-white/10'}`
            }`}
          maxLength={5}
          disabled={loading}
        />
      </div>

      {error && (
        <div className={`flex items-center gap-2 animate-pulse ${isLight ? 'text-red-600' : 'text-brand-coral'}`}>
          <X size={16} />
          <span className="text-sm font-medium">Please enter a valid 5-digit ZIP code</span>
        </div>
      )}

      <button
        type="submit"
        disabled={val.length < 5 || loading}
        style={{
          boxShadow: isLight
            ? SHADOW_LIGHT
            : undefined
        }}
        className={`w-full max-w-sm py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isLight
          ? 'bg-[#0590a8] hover:bg-[#047c91] text-white hover:translate-y-[1px] active:shadow-inner'
          : 'bg-brand-teal hover:bg-brand-lightTeal text-white shadow-xl'
          }`}
      >
        {loading ? (
          <span className="animate-pulse">Checking Coverage...</span>
        ) : (
          <>Check Availability <ArrowRight size={20} /></>
        )}
      </button>
    </form>
  );
};
