
import React from 'react';
import Header from './Header';
import PatientScoreHeader from './PatientScoreHeader';
import ActivityImprovement from './ActivityImprovement';
import AIAnalysisSection from './AIAnalysisSection';
import TreatmentMetrics from './TreatmentMetrics';
import EnsuringYourSuccess from './EnsuringYourSuccess';
import NextStepsSection from './NextStepsSection';
import SpecialPackageSection from './SpecialPackageSection';
import { useQuiz } from '../../../context/QuizContext';

interface FinalReportViewProps {
    score?: number;
    patientName?: string;
    joint?: string;
    outlook?: string;
}

const FinalReportView = ({
    score = 86,
    patientName: defaultName = "Guest Patient",
    joint = "Low Back Pain & Radiculopathy",
    outlook = "Good"
}: FinalReportViewProps) => {
    const { state } = useQuiz();
    const firstName = state.answers.firstName || '';
    const lastName = state.answers.lastName || '';
    const fullName = firstName ? `${firstName} ${lastName}`.trim() : defaultName;

    // Sample chart data for recovery progress
    const chartData = [
        { name: 'Week 1', value: 30 },
        { name: 'Week 2', value: 45 },
        { name: 'Week 3', value: 60 },
        { name: 'Week 4', value: 75 },
        { name: 'Week 6', value: 85 },
        { name: 'Week 8', value: 90 },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header
                score={score}
                patientName={fullName}
                joint={joint}
                outlook={outlook}
                chartData={chartData}
            />

            <div className="max-w-6xl mx-auto pb-32">
                <PatientScoreHeader 
                    score={score}
                    patientName={fullName}
                    joint={joint}
                    outlook={outlook}
                    chartData={chartData}
                />
                
                <ActivityImprovement patientName={fullName} />
                
                <AIAnalysisSection patientName={fullName} />
                
                <TreatmentMetrics patientName={fullName} />
                
                <EnsuringYourSuccess />
                
                <NextStepsSection />
                
                <SpecialPackageSection />
            </div>
        </div>
    );
};

export default FinalReportView;
