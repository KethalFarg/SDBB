
import React from 'react';
import FinalReportView from '../components/results/FinalReport/FinalReportView';

const FinalReport = () => {
    // Logic to calculate score could go here
    return (
        <FinalReportView
            score={86} // Could be dynamic
            patientName="Guest Patient"
        />
    );
};

export default FinalReport;
