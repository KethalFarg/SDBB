import React from 'react';
import { Brain } from 'lucide-react';
import PatientScoreHeader from './PatientScoreHeader';
import AIAnalysisSection from './AIAnalysisSection';
import TreatmentMetrics from './TreatmentMetrics';
import ActivityImprovement from './ActivityImprovement';
import NextStepsSection from './NextStepsSection';
import SpecialPackageSection from './SpecialPackageSection';
import EnsuringYourSuccess from './EnsuringYourSuccess';

const PatientScore = () => {
  const score = 86;
  const patientName = "Sarah Johnson";
  const joint = "Low Back Pain & Radiculopathy";
  const outlook = "GOOD";

  // Sample data for the line graph
  const chartData = [
    { name: 'Week 1', value: 45 },
    { name: 'Week 2', value: 52 },
    { name: 'Week 3', value: 61 },
    { name: 'Week 4', value: 68 },
    { name: 'Week 5', value: 72 },
    { name: 'Week 6', value: 77 },
  ];

  return (
    <>
      <style>
        {`
          @keyframes loader_5191 {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .square {
            background: #ddd;
            width: 10px;
            height: 10px;
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -5px;
            margin-left: -5px;
          }

          #sq1 {
            margin-top: -25px;
            margin-left: -25px;
            animation: loader_5191 675ms ease-in-out 0s infinite alternate;
          }

          #sq2 {
            margin-top: -25px;
            animation: loader_5191 675ms ease-in-out 75ms infinite alternate;
          }

          #sq3 {
            margin-top: -25px;
            margin-left: 15px;
            animation: loader_5191 675ms ease-in-out 150ms infinite;
          }

          #sq4 {
            margin-left: -25px;
            animation: loader_5191 675ms ease-in-out 225ms infinite;
          }

          #sq5 {
            animation: loader_5191 675ms ease-in-out 300ms infinite;
          }

          #sq6 {
            margin-left: 15px;
            animation: loader_5191 675ms ease-in-out 375ms infinite;
          }

          #sq7 {
            margin-top: 15px;
            margin-left: -25px;
            animation: loader_5191 675ms ease-in-out 450ms infinite;
          }

          #sq8 {
            margin-top: 15px;
            animation: loader_5191 675ms ease-in-out 525ms infinite;
          }

          #sq9 {
            margin-top: 15px;
            margin-left: 15px;
            animation: loader_5191 675ms ease-in-out 600ms infinite;
          }

          .loader-container {
            position: relative;
            width: 60px;
            height: 60px;
          }

          @keyframes bar-grow {
            from {
              height: 0%;
            }
            to {
              height: var(--bar-height);
            }
          }

          .animated-bar {
            animation: bar-grow 2s ease-out forwards;
          }

          .bar-1 { --bar-height: 90%; animation-delay: 0.2s; }
          .bar-2 { --bar-height: 75%; animation-delay: 0.4s; }
          .bar-3 { --bar-height: 85%; animation-delay: 0.6s; }
          .bar-4 { --bar-height: 70%; animation-delay: 0.8s; }
          .bar-5 { --bar-height: 90%; animation-delay: 1.0s; }
        `}
      </style>

      <div className="w-full pt-12 pb-2" style={{backgroundColor: '#F2FAFA'}}>
        <div className="max-w-6xl mx-auto px-6">
          <PatientScoreHeader 
            score={score}
            patientName={patientName}
            joint={joint}
            outlook={outlook}
            chartData={chartData}
          />
        </div>
      </div>

      <ActivityImprovement />

      {/* GRAY SECTION - Contains AI Analysis only */}
      <div className="w-full pb-6" style={{ backgroundColor: '#F2FAFA' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="p-8 shadow-lg" style={{ backgroundColor: '#f2f3f5' }}>
            <div className="flex items-start gap-8">
              {/* Left column - AI Analysis title with icon and animation */}
              <div className="flex-shrink-0" style={{ width: '17%' }}>
                <div className="flex items-center gap-3 mb-6">
                  {/* Orange rounded square with brain icon */}
                  <div className="rounded-lg p-2 shadow-md" style={{ backgroundColor: '#fa684b' }}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    AI Analysis
                  </h3>
                </div>
                
                {/* Animation container */}
                <div className="flex justify-center">
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
                </div>
              </div>

              {/* Vertical separator */}
              <div className="w-px h-32 bg-gray-300"></div>

              {/* Right section - Analysis text */}
              <div className="flex-1">
                <div className="text-gray-800 leading-relaxed">
                  <p className="mb-4">
                    <strong>Sarah</strong>,
                  </p>
                  <p className="mb-4">
                    Your treatment metrics show excellent potential for rapid results—often within just a few weeks. This is well within the expected range: spinal‑decompression therapy targets and rehabilitates the damaged discs in your lower back, typically leading to long‑term pain relief and lasting improvements in mobility. Studies demonstrate exceptionally high success rates in radiculopathy cases like yours.
                  </p>
                  <div className="bg-white rounded-lg border-2 p-4 mt-4" style={{ borderColor: '#30a5bf', color: '#30a5bf' }}>
                    <p>
                      Because you're a strong candidate, you qualify for a trial treatment with a preferred provider. See the details below to begin your road to recovery and better mobility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TreatmentMetrics />

      <EnsuringYourSuccess />

      <NextStepsSection />

      <SpecialPackageSection />
    </>
  );
};

export default PatientScore;
