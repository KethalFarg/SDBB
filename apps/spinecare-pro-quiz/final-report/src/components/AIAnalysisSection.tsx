
import React from 'react';
import { Brain } from 'lucide-react';

interface AIAnalysisSectionProps {
  patientName: string;
}

const AIAnalysisSection = ({ patientName }: AIAnalysisSectionProps) => {
  return (
    <div className="border border-white/30 p-8 shadow-lg" style={{ backgroundColor: '#e1ecf2' }}>
      {/* Glass panel overlay with reduced opacity - hidden on desktop */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/70 p-6 shadow-md md:bg-transparent md:backdrop-blur-none md:border-none md:shadow-none md:p-0">
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
          <div className="w-px h-32 bg-gray-400"></div>

          {/* Right section - Analysis text */}
          <div className="flex-1">
            <div className="text-gray-800 leading-relaxed">
              <p className="mb-4">
                <strong>{patientName}</strong>,
              </p>
              <p className="mb-4">
                Our analysis of your <strong className="font-bold" style={{ color: '#fa684b' }}>low‑back pain with radiculopathy</strong>, using our institutional and clinical‑studies database, indicates <strong className="font-bold" style={{ color: '#30a5bf' }}>highly favorable potential outcomes and a strong likelihood of lasting relief</strong>. The right spinal‑decompression equipment and protocol have proven effective for patients whose profiles—and three‑year pain history—match yours.
              </p>
              <p>
                Please see the estimated treatment metrics below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisSection;
