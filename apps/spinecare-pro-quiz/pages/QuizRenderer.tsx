import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { QUIZ_CONFIG } from '../constants';
import { Header } from '../components/layout/Header';
import { GenderLanding } from '../components/questions/GenderLanding';
import { PictureTiles } from '../components/questions/PictureTiles';
import { TileGrid } from '../components/questions/TileGrid';
import { PainSlider } from '../components/questions/PainSlider';
import { FullButtons, YesNo, TextInput } from '../components/questions/GenericInputs';
import { LoadingSlide } from '../components/info/LoadingSlide';
import { BodyMapSelector } from '../components/questions/BodyMapSelector';
import FinalReport from './FinalReport';
import PainProfile from '../components/results/PainProfile';
import { InfoSlide } from '../components/questions/InfoSlide';
import { SplitImageOptions } from '../components/questions/SplitImageOptions';
import { MedicalExit } from '../components/forms/MedicalExit';
import { PhoneCapture } from '../components/forms/PhoneCapture';
import { NameEmailCapture } from '../components/forms/NameEmailCapture';
import { QuestionConfig } from '../types';
import StickyReportButton from '../components/results/PainProfile/StickyReportButton';
import StickyBottomSection from '../components/results/FinalReport/StickyBottomSection';
import { ArrowRight } from 'lucide-react';

// Reusable Background Component (Dark Theme)
const Background: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0F1729]">
    {/* Linear Gradient: Start Color #014B5C (Dark Teal) -> End Color #0F1729 (Dark Navy/Black) */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#014B5C] to-[#0F1729]" />

    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#2D7A8C]/20 rounded-full blur-[120px] animate-pulse-slow" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1a2a35]/40 rounded-full blur-[100px]" />

    {/* Bokeh Particles */}
    <div className="absolute top-[15%] left-[5%] w-32 h-32 bg-brand-lightTeal/5 rounded-full blur-[40px] animate-float" style={{ animationDuration: '15s' }} />
    <div className="absolute top-[40%] right-[10%] w-48 h-48 bg-brand-teal/5 rounded-full blur-[50px] animate-float" style={{ animationDuration: '20s', animationDelay: '2s' }} />
    <div className="absolute top-[25%] left-[20%] w-2 h-2 bg-white/20 rounded-full blur-[1px] animate-float" style={{ animationDuration: '8s' }} />
  </div>
);

// Custom Radial Gradient Background for Light Theme
const LightBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Radial Gradient: Lighter center (#f2feff) fading to deeper teal edges for higher contrast */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f2feff] via-[#cceaecef] to-[#88babb]" />

    {/* Intensified Glow behind content */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0590a8]/10 rounded-full blur-[120px]" />
  </div>
);

export const QuizRenderer: React.FC = () => {
  const { state } = useQuiz();
  const config = QUIZ_CONFIG.find((q) => q.id === state.currentStepId);

  // Error handling
  if (!config) return <div className="p-10 text-white">Error: Configuration not found for {state.currentStepId}</div>;

  // Render logic components
  const renderComponent = (c: QuestionConfig) => {
    switch (c.type) {
      case 'gender-landing': return <GenderLanding config={c} />;
      case 'picture-tiles': return <PictureTiles config={c} />;
      case 'tile-grid':
      case 'icon-buttons': return <TileGrid config={c} />;
      case 'pain-slider': return <PainSlider config={c} />;
      case 'full-buttons': return <FullButtons config={c} />;
      case 'yes-no': return <YesNo config={c} />;
      case 'text-input': return <TextInput config={c} />;
      case 'loading': return <LoadingSlide variant={c.componentProps?.variant} />;
      case 'body-map': return <BodyMapSelector config={c} />;
      case 'pain-profile': return <PainProfile />;
      case 'final-report': return <FinalReport />;
      case 'info-slide': return <InfoSlide config={c} />;
      case 'split-image-options': return <SplitImageOptions config={c} />;
      case 'medical-exit': return <MedicalExit />;
      case 'phone-capture': return <PhoneCapture />;
      case 'form':
        if (c.componentProps?.formType === 'name-email') {
          return <NameEmailCapture />;
        }
        return <div>Unknown Form Type</div>;
      default: return <div>Unknown Component</div>;
    }
  };

  // State flags
  const isLightTheme = config.theme === 'light';
  const isResultScreen = config.type === 'final-report';
  // Show header on everything except: Results, Loading, Start Screen (gender), Phone Capture, Name-Email Capture, Pain Profile, Medical Exit
  // Explicitly ALLOWED now: info-slide
  const showHeader = !isResultScreen && config.type !== 'loading' && config.id !== 'gender' && config.type !== 'phone-capture' && config.type !== 'pain-profile' && config.type !== 'gender-landing' && config.type !== 'medical-exit' && !(config.type === 'form' && config.componentProps?.formType === 'name-email');

  // Logic for global "Continue" button
  const showGlobalFooter = config.type !== 'gender-landing' && 
                          config.type !== 'loading' && 
                          config.type !== 'pain-profile' && 
                          config.type !== 'final-report' && 
                          config.type !== 'form' && 
                          config.type !== 'medical-exit' &&
                          config.type !== 'info-slide' &&
                          !config.autoAdvance;

  const { handleAnswer, nextQuestion } = useQuiz();

  return (
    <div className={`h-[100dvh] relative font-sans overflow-hidden flex flex-col transition-colors duration-700 ${isLightTheme ? 'bg-[#d3e6e8] text-brand-dark' : 'text-white'}`}>

      {/* Backgrounds */}
      {isLightTheme ? <LightBackground /> : <Background />}

      {showHeader && <Header />}

      <main className={`relative z-10 w-full ${config.type === 'pain-profile' || config.type === 'final-report' || config.type === 'gender-landing' || (config.type === 'form' && config.componentProps?.formType === 'name-email') ? 'max-w-full px-0 pt-0' : 'max-w-2xl mx-auto px-4 sm:px-6 pt-[100px] sm:pt-[120px]'} flex-1 flex flex-col min-h-0`}>
        <div key={config.id} className={`animate-fade-in flex flex-col flex-1 ${config.type === 'gender-landing' ? '' : 'justify-center py-4 sm:py-8'}`}>
          {/* Question Text Header */}
          {(!isResultScreen && config.question && config.type !== 'loading' && config.type !== 'info-slide' && config.type !== 'medical-exit' && config.type !== 'phone-capture' && config.type !== 'pain-profile' && config.type !== 'gender-landing') && (
            <div className="text-center mb-6 sm:mb-10 md:mb-12 mt-2 sm:mt-6 flex-shrink-0">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 sm:mb-4 leading-tight ${isLightTheme ? 'text-brand-dark' : 'text-white drop-shadow-md'}`}>
                {config.question}
              </h1>
              {config.subtext && (
                <p className={`font-bold text-xs sm:text-sm md:text-base uppercase tracking-widest opacity-70 px-4 ${isLightTheme ? 'text-gray-500' : 'text-brand-lightTeal'}`}>
                  {config.subtext}
                </p>
              )}
            </div>
          )}

          {/* Component Wrapper - Center the answer blocks */}
          <div className="flex-1 flex flex-col justify-center min-h-0 px-2 sm:px-4">
            {renderComponent(config)}
          </div>

          {/* Global Footer Button Area - Pinned to bottom of the content container */}
          {showGlobalFooter && (
            <div className="mt-auto pt-8 flex justify-center pb-4 sm:pb-8 flex-shrink-0">
              <button
                onClick={() => nextQuestion()}
                disabled={config.multiSelect && (!state.answers[config.id] || (state.answers[config.id] as any[]).length === 0)}
                className={`px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 bg-[#fa684b] text-white border-2 border-white/20 hover:bg-[#e55d43] hover:shadow-[#fa684b]/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                Continue <ArrowRight size={22} />
              </button>
            </div>
          )}
        </div>
      </main>

      {config.type === 'pain-profile' && <StickyReportButton />}
      {config.type === 'final-report' && <StickyBottomSection />}
    </div>
  );
};