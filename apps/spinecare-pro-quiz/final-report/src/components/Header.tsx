
import React, { useState, useEffect } from 'react';
import { Info, Brain } from 'lucide-react';
import { Badge } from './ui/badge';
import betterJointLogo from '../assets/better-joint-logo.png';

interface HeaderProps {
  score?: number;
  patientName?: string;
  joint?: string;
  outlook?: string;
  chartData?: Array<{ name: string; value: number }>;
}

const Header = ({ score = 86, patientName = "Sarah Johnson", joint = "Low Back Pain & Radiculopathy", outlook = "Good", chartData = [] }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      {/* Sticky white glass header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/30 text-center py-4 transition-all duration-300">
        {!isScrolled ? (
          <h1 className="text-xl font-semibold text-teal-primary">
            Your Treatment Report
          </h1>
        ) : (
          <div className="flex items-center justify-center">
            <img 
              src={betterJointLogo}
              alt="Better Joint"
              className="h-8 w-auto"
            />
          </div>
        )}
      </div>
      
      {/* Content section with logo and info */}
      <div className="bg-gray-50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 lg:gap-2">
          {/* Info box removed for desktop, moved to PatientScoreHeader */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md shadow-sm order-1 lg:order-2 lg:hidden">
            <div className="flex items-start space-x-3">
              <Info className="text-teal-primary mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-gray-700 leading-relaxed">
                These predictions are based on similar clinical cases. 
                Only a full evaluation by a provider is required to 
                determine full eligibility and likelihood of success. 
                Individual results may vary.
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile-only gradient section with score and patient info */}
      <div className="lg:hidden bg-gradient-to-r from-[#323743] to-[#30a5bf] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-6">
        <div className="flex items-start justify-between px-6 gap-4">
          {/* Left column - Miniaturized score display */}
          <div className="flex-shrink-0">
            <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 p-3 shadow-md">
              <div className="relative w-16 h-16">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-secondary to-blue-400 opacity-20 blur-sm"></div>
                
                {/* Background circle */}
                <div className="absolute inset-1 rounded-full bg-white/30 backdrop-blur-sm shadow-inner"></div>
                
                {/* Progress track */}
                <svg className="absolute inset-1 w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  
                  {/* Progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#progressGradientMobile)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${score * 2.64} 264`}
                    className="drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(48, 165, 191, 0.4))'
                    }}
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="progressGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--teal-secondary))" />
                      <stop offset="50%" stopColor="hsl(var(--teal-primary))" />
                      <stop offset="100%" stopColor="#30a5bf" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800 drop-shadow-sm">{score}</span>
                </div>
                
                {/* Highlight dot at progress end */}
                <div 
                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-teal-secondary to-blue-400 rounded-full shadow-lg"
                  style={{
                    top: '6px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${score * 3.6}deg) translateY(26px) rotate(-${score * 3.6}deg)`,
                    transformOrigin: '50% 26px'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right column - Patient information */}
          <div className="flex-1 space-y-3">
            {/* Patient name */}
            <h2 className="text-xl font-semibold text-white">
              {patientName}
            </h2>

            {/* Joint tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              >
                Low Back Pain
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              >
                Radiculopathy
              </Badge>
            </div>

            {/* Results Outlook */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-white/90 text-sm">Results Outlook:</span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg">
                {outlook}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only chart section in gray background */}
      <div className="lg:hidden bg-gray-50 py-6">
        <div className="px-2">
          {/* Treatment Progress Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-xl">
            <h3 className="text-base font-semibold text-center mb-3" style={{ color: '#309bb3' }}>Estimated Pain Reduction</h3>
            <div className="relative overflow-x-auto">
              <svg className="w-full h-auto" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <defs>
                  <pattern id="gridMobile" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                  <linearGradient id="progressGradientMobile2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#268498" />
                    <stop offset="50%" stopColor="#30a5bf" />
                    <stop offset="100%" stopColor="#30a5bf" />
                  </linearGradient>
                  <linearGradient id="progressGradientFillMobile2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#30a5bf" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#30a5bf" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                <rect width="320" height="160" x="60" y="30" fill="url(#gridMobile)" />
                
                {/* Y-axis */}
                <line x1="60" y1="30" x2="60" y2="190" stroke="#e5e7eb" strokeWidth="2"/>
                {/* X-axis */}
                <line x1="60" y1="190" x2="380" y2="190" stroke="#e5e7eb" strokeWidth="2"/>
                
                {/* Y-axis labels */}
                <text x="45" y="40" className="text-xs fill-transparent font-medium" textAnchor="end">100</text>
                <text x="45" y="70" className="text-xs fill-transparent" textAnchor="end">80</text>
                <text x="45" y="100" className="text-xs fill-transparent" textAnchor="end">60</text>
                <text x="45" y="130" className="text-xs fill-transparent" textAnchor="end">40</text>
                <text x="45" y="160" className="text-xs fill-transparent" textAnchor="end">20</text>
                <text x="45" y="190" className="text-xs fill-transparent font-medium" textAnchor="end">0</text>
                
                {/* X-axis labels */}
                <text x="80" y="205" className="text-xs fill-transparent font-medium" textAnchor="middle">Week 1</text>
                <text x="120" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 2</text>
                <text x="160" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 4</text>
                <text x="200" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 6</text>
                <text x="240" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 8</text>
                <text x="280" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 10</text>
                <text x="320" y="205" className="text-xs fill-transparent font-medium" textAnchor="middle">Week 12</text>
                <text x="340" y="205" className="text-xs fill-transparent" textAnchor="middle">Week 14</text>
                <text x="360" y="205" className="text-xs fill-transparent font-medium" textAnchor="middle">Week 16</text>
                
                {/* Vertical axis label */}
                <text x="50" y="110" className="text-xs fill-gray-500 font-medium" textAnchor="middle" transform="rotate(-90, 50, 110)">Pain Scale</text>
                
                {/* Bottom axis labels */}
                <text x="70" y="210" className="text-xs fill-gray-500 font-medium" textAnchor="start">Now</text>
                <text x="370" y="210" className="text-xs fill-gray-500 font-medium" textAnchor="end">After Treatment</text>
                
                {/* Data points and connections */}
                <g>
                  {/* Gradient fill area under the line */}
                  <path
                    d="M 80 62 L 120 68 L 160 94 L 200 70 L 240 118 L 280 94 L 320 145 L 340 158 L 360 174 L 360 190 L 80 190 Z"
                    fill="url(#progressGradientFillMobile2)"
                    opacity="0.15"
                    className="animate-fade-in"
                    style={{ 
                      animationDelay: '2.0s', 
                      animationFillMode: 'both',
                      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
                      animation: 'fade-in 0.3s ease-out 2.0s both, reveal-gradient 2s ease-out 2.0s both'
                    }}
                  />
                  
                  {/* Main line */}
                  <path
                    d="M 80 62 L 120 68 L 160 94 L 200 70 L 240 118 L 280 94 L 320 145 L 340 158 L 360 174"
                    fill="none"
                    stroke="url(#progressGradientMobile2)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-fade-in"
                    style={{ 
                      animationDelay: '2.0s', 
                      animationFillMode: 'both',
                      strokeDasharray: '400',
                      strokeDashoffset: '400',
                      animation: 'fade-in 0.3s ease-out 2.0s both, draw-line 2s ease-out 2.0s both'
                    }}
                  />
                  
                  {/* Data points */}
                   {/* First dot - pulsating red with glow */}
                   <g>
                     {/* Glow effect */}
                     <circle cx="80" cy="62" r="12" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                     <circle cx="80" cy="62" r="8" fill="#ef4444" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                     {/* Main dot */}
                     <circle cx="80" cy="62" r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="chart-dot animate-pulse" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }} />
                   </g>
                   
                   {/* Other data points - teal colored and animated with delays */}
                   <circle cx="120" cy="68" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 2.3s both' }} />
                   <circle cx="160" cy="94" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 2.6s both' }} />
                   <circle cx="200" cy="70" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 2.9s both' }} />
                   <circle cx="240" cy="118" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 3.2s both' }} />
                   <circle cx="280" cy="94" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 3.5s both' }} />
                   <circle cx="320" cy="145" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 3.8s both' }} />
                   <circle cx="340" cy="158" r="5" fill="#30a5bf" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 4.1s both' }} />
                   
                   {/* Last dot - green with glow and check icon */}
                   <g>
                     {/* Glow effect */}
                     <circle cx="360" cy="174" r="12" fill="#10b981" opacity="0.3" className="opacity-0" style={{ animation: 'scale-in 0.3s ease-out 4.4s both, pulse 2s ease-in-out 4.7s infinite' }} />
                     <circle cx="360" cy="174" r="8" fill="#10b981" opacity="0.5" className="opacity-0" style={{ animation: 'scale-in 0.3s ease-out 4.4s both, pulse 2s ease-in-out 4.9s infinite' }} />
                     {/* Main dot */}
                     <circle cx="360" cy="174" r="6" fill="#10b981" stroke="white" strokeWidth="2" className="chart-dot opacity-0" style={{ animation: 'scale-in 0.3s ease-out 4.4s both', filter: 'drop-shadow(0 0 8px #10b981)' }} />
                     
                     {/* Check icon inside */}
                     <path d="M 357 174 L 359 176 L 363 172" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0" style={{ animation: 'scale-in 0.3s ease-out 4.7s both' }} />
                   </g>
                </g>
              </svg>
            </div>
        </div>
      </div>
      </div>


      {/* New mobile-only gradient section below the graph */}
      <div className="lg:hidden bg-gradient-to-r from-[#323743] to-teal-primary w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-6">
        <div className="flex items-center justify-start px-6 mb-6">
          {/* AI Analysis animation with brain icon overlay */}
          <div className="flex-shrink-0 mr-4 relative">
            <div className="loader-container">
              <div className="square" id="sq1"></div>
              <div className="square" id="sq2"></div>
              <div className="square" id="sq3"></div>
              <div className="square" id="sq4"></div>
              <div className="square" id="sq5"></div>
              <div className="square" id="sq6"></div>
              <div className="square" id="sq7"></div>
              <div className="square" id="sq8"></div>
              <div className="square" id="sq9"></div>
            </div>
            {/* Brain icon overlay with orange background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-sm p-1 flex items-center justify-center" style={{ backgroundColor: '#fa684b' }}>
                <Brain className="text-white" size={20} />
              </div>
            </div>
          </div>
          
          {/* AI Analysis text */}
          <h3 className="text-lg font-semibold text-white">
            AI Analysis
          </h3>
        </div>

        {/* Glass pane with analysis text */}
        <div className="mx-4">
          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <div className="text-black space-y-4">
              <p className="font-semibold text-lg">Sarah,</p>
              
              <p className="leading-relaxed">
                Our analysis of your low back pain and radiculopathy condition against our patient database shows highly favorable outcomes. Pulsewave therapy has proven effective for cases matching your 13-month pain profile, with most patients achieving substantial improvement.
              </p>
              
              <p className="font-semibold">
                Please see estimated treatment metrics below
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
