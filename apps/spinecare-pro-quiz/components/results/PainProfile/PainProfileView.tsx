
import React from 'react';
import Header from "./Header";
import MobilePatientCard from "./MobilePatientCard";
import MobilePainDetails from "./MobilePainDetails";
import MobilePainContainer from "./MobilePainContainer";
import MobileMovementLifestyle from "./MobileMovementLifestyle";
import MobileAISummary from "./MobileAISummary";
import { useQuiz } from '../../../context/QuizContext';

interface PainProfileViewProps {
  avgPain?: number;
  flareUps?: number;
  name?: string;
  ageRange?: string;
}

const PainProfileView = ({
  avgPain = 6,
  flareUps = 10,
  name: defaultName = "Guest Patient",
  ageRange = "40-49"
}: PainProfileViewProps) => {
  const { state } = useQuiz();
  const firstName = state.answers.firstName || '';
  const lastName = state.answers.lastName || '';
  const fullName = firstName ? `${firstName} ${lastName}`.trim() : defaultName;

  return (
    <div className="min-h-screen relative bg-[#0F1729]">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#014B5C] to-[#0F1729] z-0" />
      
      {/* Bokeh Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#2D7A8C]/15 rounded-full blur-[120px] z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1a2a35]/30 rounded-full blur-[100px] z-0" />

      <Header />
      
      {/* Main Content Version */}
      <div className="pt-24 pb-40 px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <MobilePatientCard name={fullName} age={ageRange} />
          <MobilePainDetails />
          <MobilePainContainer avgPain={avgPain} flareUps={flareUps} />
          <MobileMovementLifestyle />
          <MobileAISummary />
        </div>
      </div>
    </div>
  );
};

export default PainProfileView;
