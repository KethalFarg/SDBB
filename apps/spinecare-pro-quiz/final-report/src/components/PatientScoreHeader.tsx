
import React from 'react';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Check, Info } from 'lucide-react';

interface PatientScoreHeaderProps {
  score: number;
  patientName: string;
  joint: string;
  outlook: string;
  chartData: Array<{ name: string; value: number }>;
}

const PatientScoreHeader = ({ score, patientName, joint, outlook, chartData }: PatientScoreHeaderProps) => {
  return (
    <>
      {/* Mobile Patient Score Container */}
      <div className="block lg:hidden bg-gradient-to-r from-[#323743] to-[#30a5bf] rounded-2xl border border-white/30 p-6 shadow-lg mb-4">
        <div className="text-center space-y-4">
          {/* Patient name */}
          <h2 className="text-lg font-semibold text-white">
            {patientName}
          </h2>

          {/* Score display */}
          <div className="flex justify-center">
            <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-md">
              <div className="relative w-24 h-24 mx-auto">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-secondary to-blue-400 opacity-20 blur-sm"></div>
                
                {/* Background circle */}
                <div className="absolute inset-1 rounded-full bg-white/30 backdrop-blur-sm shadow-inner"></div>
                
                {/* Progress track */}
                <svg className="absolute inset-1 w-22 h-22 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  
                  {/* Progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#progressGradientMobile)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${score * 2.64} 264`}
                    className="drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
                    }}
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                     <linearGradient id="progressGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#268498" />
                       <stop offset="50%" stopColor="#30a5bf" />
                       <stop offset="100%" stopColor="#30a5bf" />
                     </linearGradient>
                  </defs>
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xl font-bold text-gray-800 drop-shadow-sm">{score}</span>
                    <div className="text-xs text-gray-600 font-medium">SCORE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Joint tags */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 text-xs"
            >
              Low Back Pain
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 text-xs"
            >
              Radiculopathy
            </Badge>
          </div>

          {/* Pulsewave Score */}
          <div className="text-white/90 text-sm">
            <span className="font-medium">Spinal decompression score: </span>
            <span className="font-bold text-white">{score}</span>
          </div>

          {/* Overall Outlook */}
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium text-white/90 text-sm">Overall Outlook:</span>
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 text-xs"
            >
              Positive
            </Badge>
          </div>
        </div>
      </div>

      {/* Desktop Patient Score Container */}
      <div className="hidden lg:block bg-gradient-to-r from-[#323743] to-[#30a5bf] rounded-t-2xl border border-white/30 p-8 shadow-lg">
        <div className="flex items-center gap-8">
          {/* Score section with glass panel effect */}
          <div className="flex-shrink-0">
            <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 p-6 shadow-md">
              <div className="relative w-32 h-32 mx-auto">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-secondary to-blue-400 opacity-20 blur-sm"></div>
                
                {/* Background circle */}
                <div className="absolute inset-2 rounded-full bg-white/30 backdrop-blur-sm shadow-inner"></div>
                
                {/* Progress track */}
                <svg className="absolute inset-2 w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
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
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${score * 2.64} 264`}
                    className="drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
                    }}
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                     <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#268498" />
                       <stop offset="50%" stopColor="#30a5bf" />
                       <stop offset="100%" stopColor="#30a5bf" />
                     </linearGradient>
                  </defs>
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-800 drop-shadow-sm">{score}</span>
                    <div className="text-xs text-gray-600 font-medium">SCORE</div>
                  </div>
                </div>
                
                {/* Highlight dot at progress end */}
                <div 
                  className="absolute w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full shadow-lg"
                  style={{
                    top: '14px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${score * 3.6}deg) translateY(42px) rotate(-${score * 3.6}deg)`,
                    transformOrigin: '50% 42px'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Vertical separator */}
          <div className="w-px h-20 bg-white/30"></div>

          {/* Patient information */}
          <div className="flex-1 space-y-3">
            {/* Patient name */}
            <h2 className="text-xl font-semibold text-white">
              {patientName}
            </h2>

            {/* Joint tags */}
            <div className="flex gap-2">
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

            {/* Pulsewave Score */}
            <div className="text-white/90">
              <span className="font-medium">Spinal decompression score: </span>
              <span className="font-bold text-lg text-white">{score}</span>
            </div>

            {/* Overall Outlook */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-white/90">Overall Outlook:</span>
              <Badge 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              >
                Positive
              </Badge>
            </div>
          </div>

          {/* Vertical separator */}
          <div className="w-px h-20 bg-white/30"></div>

          {/* Disclaimer section */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm flex-1">
                  These predictions are based on similar clinical cases. Only a full evaluation by a provider is required to determine full eligibility and likelihood of success. Individual results may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Container - Image and Graph - Hidden on mobile */}
      <div className="hidden lg:block bg-gray-100 p-8 shadow-lg">
        <div className="flex items-center gap-8 relative">
          {/* Pain Assessment Tag - positioned at container edge */}
          <div className="absolute left-16 top-3 transform z-10">
            {/* Assessment details */}
            <div className="ml-4 space-y-1">
              <div className="flex items-center gap-2 mt-2">
                <span className="text-black text-sm font-medium">Potential pain reduction outlook:</span>
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg text-xs">
                  Good
                </Badge>
              </div>
              
              {/* Anatomy Image */}
              <div className="mt-4">
                <img 
                  src="/lovable-uploads/a1375ace-99dc-4e30-bf0f-4659b2dce9f5.png" 
                  alt="Patient anatomy showing pain areas" 
                  className="w-80 h-auto rounded-lg"
                />
              </div>
              
            </div>
          </div>

          {/* Quiz Stats Info Box */}
          <div className="absolute right-8 top-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
              <div className="text-xs text-gray-600 font-medium">
                <div>AVG PAIN: <span className="font-semibold text-gray-800">6</span></div>
                <div>FLARE-UPS: <span className="font-semibold text-gray-800">10</span></div>
              </div>
            </div>
          </div>

          {/* Left side - Empty space for tag */}
          <div className="flex-1">
          </div>

          {/* Right side - Treatment Progress Chart */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow-lg" style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))' }}>
            <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: '#309bb3' }}>Estimated Pain Reduction</h3>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 240">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="320" height="160" x="60" y="30" fill="url(#grid)" />
                
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
                    fill="url(#progressGradientFill)"
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
                    stroke="url(#progressGradient)"
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
                   {/* First dot - pulsating red with glow and label */}
                   <g>
                     {/* Glow effect */}
                     <circle cx="80" cy="62" r="12" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                     <circle cx="80" cy="62" r="8" fill="#ef4444" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                     {/* Main dot */}
                     <circle cx="80" cy="62" r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="chart-dot animate-pulse" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }} />
                     
                     {/* Label line and text */}
                     <line x1="80" y1="50" x2="80" y2="40" stroke="#ef4444" strokeWidth="2" />
                     <line x1="80" y1="40" x2="140" y2="40" stroke="#ef4444" strokeWidth="2" />
                     <text x="145" y="44" className="text-xs fill-red-500 font-semibold">Current pain level</text>
                   </g>
                  <circle cx="120" cy="68" r="4" fill="#f97316" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '0.4s' }} />
                  <circle cx="160" cy="94" r="5" fill="#f59e0b" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '0.6s' }} />
                  <circle cx="200" cy="70" r="4" fill="#eab308" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '0.8s' }} />
                  <circle cx="240" cy="118" r="5" fill="#84cc16" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '1.0s' }} />
                  <circle cx="280" cy="94" r="4" fill="#65a30d" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '1.2s' }} />
                  <circle cx="320" cy="145" r="5" fill="#22c55e" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '1.4s' }} />
                  <circle cx="340" cy="158" r="4" fill="#059669" stroke="white" strokeWidth="2" className="chart-dot animate-scale-in" style={{ animationDelay: '1.6s' }} />
                   {/* Last dot - pulsating green with glow (appears after line animation) */}
                   <g>
                     {/* Glow effect */}
                     <circle cx="360" cy="174" r="12" fill="#22c55e" opacity="0.3" className="animate-pulse" style={{ animationDelay: '4.5s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 4.5s both, pulse 2s infinite 4.5s' }} />
                     <circle cx="360" cy="174" r="8" fill="#22c55e" opacity="0.5" className="animate-pulse" style={{ animationDelay: '5.0s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 5.0s both, pulse 2s infinite 5.0s' }} />
                     {/* Main dot */}
                     <circle cx="360" cy="174" r="6" fill="#22c55e" stroke="white" strokeWidth="2" className="chart-dot" style={{ filter: 'drop-shadow(0 0 8px #22c55e)', animationDelay: '4.0s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 4.0s both, pulse 2s infinite 4.0s' }} />
                   </g>
                </g>
                
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#84cc16" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="progressGradientFill" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#84cc16" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Treatment Progress Chart */}
      <div className="block lg:hidden bg-white mx-4 mb-4 rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#309bb3' }}>Estimated Pain Reduction</h3>
        <div className="h-32 relative">
          <svg className="w-full h-full" viewBox="0 0 300 120">
            {/* Grid lines */}
            <defs>
              <pattern id="gridMobile" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="240" height="80" x="40" y="20" fill="url(#gridMobile)" />
            
            {/* Y-axis */}
            <line x1="40" y1="20" x2="40" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
            {/* X-axis */}
            <line x1="40" y1="100" x2="280" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
            
            {/* Y-axis labels */}
            <text x="35" y="25" className="text-xs fill-gray-500" textAnchor="end">10</text>
            <text x="35" y="45" className="text-xs fill-gray-500" textAnchor="end">8</text>
            <text x="35" y="65" className="text-xs fill-gray-500" textAnchor="end">6</text>
            <text x="35" y="85" className="text-xs fill-gray-500" textAnchor="end">4</text>
            <text x="35" y="100" className="text-xs fill-gray-500" textAnchor="end">0</text>
            
            {/* X-axis labels - simplified */}
            <text x="60" y="112" className="text-xs fill-gray-500" textAnchor="middle">W1</text>
            <text x="120" y="112" className="text-xs fill-gray-500" textAnchor="middle">W6</text>
            <text x="180" y="112" className="text-xs fill-gray-500" textAnchor="middle">W12</text>
            <text x="240" y="112" className="text-xs fill-gray-500" textAnchor="middle">W16</text>
            
            {/* Vertical axis label */}
            <text x="30" y="60" className="text-xs fill-gray-500 font-medium" textAnchor="middle" transform="rotate(-90, 30, 60)">Pain Scale</text>
            
            {/* Bottom axis labels */}
            <text x="50" y="115" className="text-xs fill-gray-500 font-medium" textAnchor="start">Now</text>
            <text x="270" y="115" className="text-xs fill-gray-500 font-medium" textAnchor="end">After Treatment</text>
            
            {/* Data points and connections - simplified */}
            <g>
              {/* Gradient fill area under the line */}
              <path
                d="M 60 36 L 120 40 L 180 70 L 240 85 L 240 100 L 60 100 Z"
                fill="url(#progressGradientFillMobile)"
                opacity="0.15"
              />
              
              {/* Main line */}
              <path
                d="M 60 36 L 120 40 L 180 70 L 240 85"
                fill="none"
                stroke="url(#progressGradientMobile)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points - simplified */}
              {/* First dot - pulsating red with glow and label */}
              <g>
                {/* Glow effect for mobile */}
                <circle cx="60" cy="36" r="8" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                <circle cx="60" cy="36" r="5" fill="#ef4444" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                {/* Main dot */}
                <circle cx="60" cy="36" r="4" fill="#ef4444" stroke="white" strokeWidth="1" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
                
                {/* Label line and text for mobile */}
                <line x1="60" y1="28" x2="60" y2="22" stroke="#ef4444" strokeWidth="1" />
                <line x1="60" y1="22" x2="100" y2="22" stroke="#ef4444" strokeWidth="1" />
                <text x="105" y="25" className="text-xs fill-red-500 font-semibold">Current pain</text>
              </g>
              <circle cx="120" cy="40" r="3" fill="#f59e0b" stroke="white" strokeWidth="1" />
              <circle cx="180" cy="70" r="3" fill="#22c55e" stroke="white" strokeWidth="1" />
              {/* Last dot - pulsating green with glow (appears after line animation) */}
              <g>
                {/* Glow effect for mobile */}
                <circle cx="240" cy="85" r="8" fill="#22c55e" opacity="0.3" className="animate-pulse" style={{ animationDelay: '4.5s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 4.5s both, pulse 2s infinite 4.5s' }} />
                <circle cx="240" cy="85" r="5" fill="#22c55e" opacity="0.5" className="animate-pulse" style={{ animationDelay: '5.0s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 5.0s both, pulse 2s infinite 5.0s' }} />
                {/* Main dot */}
                <circle cx="240" cy="85" r="4" fill="#22c55e" stroke="white" strokeWidth="1" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 4px #22c55e)', animationDelay: '4.0s', animationFillMode: 'both', opacity: '0', animation: 'fade-in 0.3s ease-out 4.0s both, pulse 2s infinite 4.0s' }} />
              </g>
            </g>
            
            {/* Gradient definitions for mobile */}
            <defs>
              <linearGradient id="progressGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f59e0b" />
                <stop offset="66%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient id="progressGradientFillMobile" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f59e0b" />
                <stop offset="66%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
};

export default PatientScoreHeader;
