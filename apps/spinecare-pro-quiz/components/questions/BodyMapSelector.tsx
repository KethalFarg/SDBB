import React, { useState, useEffect } from 'react';
import { QuestionConfig } from '../../types';
import { useQuiz } from '../../context/QuizContext';

const SHADOW_LIGHT = '5px 5px 10px rgba(1, 75, 92, 0.6), -4px -4px 8px rgba(255, 255, 255, 1)';
const SHADOW_PRESSED = 'inset 4px 4px 8px rgba(1, 75, 92, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)';

const REGION_COLORS = {
  'Neck': '#F2674B',
  'Arm / Shoulder': '#F2684B',
  'Back': '#F2674C',
  'Buttocks / Leg': '#F2674D',
};

// Base body color (inactive state) - matching the skeletal white color
const INACTIVE_COLOR = '#ffffff'; // White to match the spine/skeleton when not highlighted

interface WrapperProps {
  config: QuestionConfig;
}

export const BodyMapSelector: React.FC<WrapperProps> = ({ config }) => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const initialSelected = (state.answers[config.id as keyof typeof state.answers] as string[]) || [];
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [svgContent, setSvgContent] = useState<string>('');
  const isLight = config.theme === 'light';

  useEffect(() => {
    fetch('/bodymap2.svg')
      .then(res => res.text())
      .then(data => setSvgContent(data))
      .catch(err => console.error('Error loading SVG:', err));
  }, []);

  const toggleSelect = (value: string) => {
    let newSelected;
    if (selected.includes(value)) {
      newSelected = selected.filter(v => v !== value);
    } else {
      if (config.maxSelections && selected.length >= config.maxSelections) {
        newSelected = [...selected.slice(0, config.maxSelections - 1), value];
      } else {
        newSelected = [...selected, value];
      }
    }
    setSelected(newSelected);
    // Save answer immediately so global button works
    handleAnswer(config.id as any, newSelected);
  };

  return (
    <div className="flex flex-col w-full h-full pt-4 md:pt-10">
      <div className="flex flex-row items-center justify-center gap-1 md:gap-4 w-full flex-1 max-w-6xl mx-auto px-2 md:px-4">

        {/* Left Options (Back, Buttocks/Leg) - Aligned Lower */}
        <div className="w-1/3 flex flex-col gap-6 justify-center items-end">
          {config.options?.filter(opt => ['Back', 'Buttocks / Leg'].includes(String(opt.value))).map((option) => {
            const isSelected = selected.includes(String(option.value));
            return (
              <button
                key={String(option.value)}
                onClick={() => toggleSelect(String(option.value))}
                className={`
                        group relative w-full md:w-48 py-3 px-2 md:px-4 rounded-xl border transition-all duration-200
                        flex items-center justify-center text-center text-sm md:text-base font-medium backdrop-blur-sm shadow-sm
                        min-h-[3.5rem] leading-tight
                        ${isLight
                    ? (isSelected
                      ? 'bg-[#0590a8] border-[#0590a8] text-white scale-[0.98]'
                      : 'bg-white border-2 border-[#0590a8] text-[#0590a8] hover:bg-gray-50 hover:translate-y-[1px]')
                    : (isSelected
                      ? 'bg-brand-teal/20 border-brand-teal text-white shadow-[0_0_10px_rgba(2,152,179,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20')
                  }
                    `}
                style={{
                  boxShadow: isLight
                    ? (isSelected ? SHADOW_PRESSED : SHADOW_LIGHT)
                    : undefined
                }}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Image - Bigger (2/4) - Now Inline SVG with Dynamic Styles */}
        <div className="w-1/3 flex justify-center items-center">
          <div className="relative w-full flex justify-center h-[45vh] -mt-4">
            <style>
              {`
                /* Default: Turn off specific highlight colors by forcing them to inactive teal */
                ${Object.values(REGION_COLORS).map(color => `svg [fill="${color}" i]`).join(', ')} {
                  fill: ${INACTIVE_COLOR} !important;
                  transition: fill 0.3s ease;
                  cursor: pointer;
                }
                ${Object.values(REGION_COLORS).map(color => `svg [fill="${color}" i]:hover`).join(', ')} {
                  opacity: 0.8;
                }
                
                /* Dynamic: Turn them back on if selected */
                ${selected.map(region => {
                const color = REGION_COLORS[region as keyof typeof REGION_COLORS];
                return color ? `svg [fill="${color}" i] { fill: ${color} !important; }` : '';
              }).join('\n')}
              `}
            </style>
            <div
              className="h-full w-full flex justify-center items-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full drop-shadow-sm"
              dangerouslySetInnerHTML={{ __html: svgContent }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const fill = target.getAttribute('fill');
                // Find region matching this fill color (case insensitive check)
                if (fill) {
                  const region = Object.keys(REGION_COLORS).find(key =>
                    REGION_COLORS[key as keyof typeof REGION_COLORS].toLowerCase() === fill.toLowerCase()
                  );
                  if (region) {
                    toggleSelect(region);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Options (Neck, Arm/Shoulder) - Aligned Higher */}
        <div className="w-1/3 flex flex-col gap-6 justify-center items-start">
          {config.options?.filter(opt => ['Neck', 'Arm / Shoulder'].includes(String(opt.value))).map((option) => {
            const isSelected = selected.includes(String(option.value));
            return (
              <button
                key={String(option.value)}
                onClick={() => toggleSelect(String(option.value))}
                className={`
                        group relative w-full md:w-48 py-3 px-2 md:px-4 rounded-xl border transition-all duration-200
                        flex items-center justify-center text-center text-sm md:text-base font-medium backdrop-blur-sm shadow-sm
                        min-h-[3.5rem] leading-tight
                        ${isLight
                    ? (isSelected
                      ? 'bg-[#0590a8] border-[#0590a8] text-white scale-[0.98]'
                      : 'bg-white border-2 border-[#0590a8] text-[#0590a8] hover:bg-gray-50 hover:translate-y-[1px]')
                    : (isSelected
                      ? 'bg-brand-teal/20 border-brand-teal text-white shadow-[0_0_10px_rgba(2,152,179,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20')
                  }
                    `}
                style={{
                  boxShadow: isLight
                    ? (isSelected ? SHADOW_PRESSED : SHADOW_LIGHT)
                    : undefined
                }}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
