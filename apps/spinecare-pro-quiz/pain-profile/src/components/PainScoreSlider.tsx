import { useEffect, useState } from "react";

interface PainScoreSliderProps {
  isMobile?: boolean;
}

const PainScoreSlider = ({ isMobile = false }: PainScoreSliderProps) => {
  const [animatedPosition, setAnimatedPosition] = useState(0);

  // Function to get the color at a specific position on the gradient
  const getGradientColor = (position: number) => {
    const normalizedPos = position / 100;
    
    const gradientStops = [
      { pos: 0, color: [173, 216, 247] }, // #ADD8F7
      { pos: 0.33, color: [158, 224, 147] }, // #9EE093
      { pos: 0.66, color: [255, 210, 124] }, // #FFD27C
      { pos: 1, color: [255, 122, 92] } // #FF7A5C
    ];
    
    let lowerStop = gradientStops[0];
    let upperStop = gradientStops[gradientStops.length - 1];
    
    for (let i = 0; i < gradientStops.length - 1; i++) {
      if (normalizedPos >= gradientStops[i].pos && normalizedPos <= gradientStops[i + 1].pos) {
        lowerStop = gradientStops[i];
        upperStop = gradientStops[i + 1];
        break;
      }
    }
    
    const range = upperStop.pos - lowerStop.pos;
    const factor = range === 0 ? 0 : (normalizedPos - lowerStop.pos) / range;
    
    const r = Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * factor);
    const g = Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * factor);
    const b = Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPosition(88);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const sliderHeight = isMobile ? "h-2" : "h-4";
  const indicatorSize = isMobile ? "w-6 h-6" : "w-8 h-8";
  const borderWidth = isMobile ? "border-4" : "border-4";

  return (
    <div className={isMobile ? "mb-4 mt-20" : "pr-8"}>
      <div className={`relative ${sliderHeight} rounded-full bg-gradient-to-r from-[#ADD8F7] via-[#9EE093] via-[#FFD27C] to-[#FF7A5C]`}>
        <div 
          className={`absolute top-1/2 -translate-y-1/2 ${indicatorSize} rounded-full ${borderWidth} border-white shadow-lg transition-all duration-1000`}
          style={{ 
            left: `${animatedPosition}%`,
            backgroundColor: getGradientColor(animatedPosition),
            boxShadow: isMobile ? '0 2px 6px rgba(0, 0, 0, 0.2)' : '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
        <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>VERY HIGH</span>
      </div>
    </div>
  );
};

export default PainScoreSlider;
