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

  return (
    <div className={`h-[100dvh] relative font-sans overflow-hidden flex flex-col transition-colors duration-700 ${isLightTheme ? 'bg-[#d3e6e8] text-brand-dark' : 'text-white'}`}>

      {/* Backgrounds */}
      {isLightTheme ? <LightBackground /> : <Background />}

      {showHeader && <Header />}

      <main className={`relative z-10 w-full ${config.type === 'pain-profile' || config.type === 'final-report' || config.type === 'gender-landing' || (config.type === 'form' && config.componentProps?.formType === 'name-email') ? 'max-w-full' : 'max-w-2xl mx-auto px-4 sm:px-6'} flex-1 flex flex-col overflow-y-auto ${config.type === 'gender-landing'
        ? 'py-0'
        : showHeader
          ? 'pt-24 sm:pt-28 pb-4 sm:pb-6'
          : 'justify-center py-6'
        }`}>
        <div key={config.id} className="animate-fade-in flex flex-col h-full">
          {/* Question Text Header (Hide for Info Slides/Results/Loading/Phone/Empty Question) */}
          {(!isResultScreen && config.question && config.type !== 'loading' && config.type !== 'info-slide' && config.type !== 'medical-exit' && config.type !== 'phone-capture' && config.type !== 'pain-profile' && config.type !== 'gender-landing') && (
            <div className="text-center mb-4 sm:mb-8 md:mb-10 mt-1 sm:mt-6 md:mt-8 flex-shrink-0">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-3 leading-tight ${isLightTheme ? 'text-brand-dark' : 'text-white drop-shadow-md'}`}>
                {config.question}
              </h1>
              {config.subtext && (
                <p className={`font-medium text-sm sm:text-base md:text-lg ${isLightTheme ? 'text-gray-500' : 'text-brand-lightTeal'}`}>
                  {config.subtext}
                </p>
              )}
            </div>
          )}

          {/* Component Wrapper */}
          <div className="flex-1 flex flex-col justify-start min-h-0">
            {renderComponent(config)}
          </div>
        </div>
      </main>

      {config.type === 'pain-profile' && <StickyReportButton />}
      {config.type === 'final-report' && <StickyBottomSection />}
    </div>
  );
};