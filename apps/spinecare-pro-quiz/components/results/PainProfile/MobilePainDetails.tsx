
import React from 'react';
import { useQuiz } from '../../../context/QuizContext';

const MobilePainDetails = () => {
  const { state } = useQuiz();
  const { answers } = state;

  const location = Array.isArray(answers['pain-regions']) 
    ? answers['pain-regions'].join(', ') 
    : 'Lower back';
    
  const diagnoses = Array.isArray(answers['diagnosis']) 
    ? answers['diagnosis'].join(', ') 
    : 'Not specified';
    
  const duration = answers['duration'] || 'Not specified';
  const mri = answers['mri'] || 'Yes';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Pain location:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-4">{location}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Diagnoses:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-4">{diagnoses}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Pain duration:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-4">{duration}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Previous MRI:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-4">{mri}</span>
        </div>
      </div>
    </div>
  );
};

export default MobilePainDetails;
