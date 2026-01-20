
import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import PainProfileView from './PainProfile/PainProfileView';

const PainProfile: React.FC = () => {
    const { state } = useQuiz();
    const { answers } = state;

    const primaryRegion = answers.primary_region || (answers.pain_regions && answers.pain_regions[0]) || 'affected area';
    const duration = answers.duration || answers.pain_duration || 'Not specified';

    // Calculate average pain from answers - fallback to default for now
    const avgPain = answers['avg-pain'] ? parseInt(answers['avg-pain'], 10) : 6;
    const flareUps = answers['flare-ups'] ? parseInt(answers['flare-ups'], 10) : 10;

    const ageRange = answers.age || "40-49";

    return (
        <PainProfileView
            name="Guest Patient" // We don't have name input yet?
            ageRange={ageRange}
            avgPain={avgPain}
            flareUps={flareUps}
        />
    );
};

export default PainProfile;
