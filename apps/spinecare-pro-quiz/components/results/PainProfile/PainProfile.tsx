
import { Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProfileDetails from "./ProfileDetails";
import { useEffect, useState } from "react";

const PainProfile = () => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const currentPainLevel = 5;

  useEffect(() => {
    // Animate the progress bar on component mount
    const timer = setTimeout(() => {
      setAnimatedValue((currentPainLevel / 10) * 100);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPainLevel]);

  const patientData = {
    name: "Johnson, Sarah", 
    ageRange: "40-49"
  };

  const profileData = {
    painLocation: "Lower back (lumbar), Leg Pain (radiculopathy)",
    diagnosis: "Herniated Disc, Sciatica", 
    restrictedMobility: "Yes",
    painDuration: "3 years",
    previousMRI: "Yes"
  };

  const getPainLevelDescription = (level: number) => {
    if (level <= 2) return { text: "LOW level", color: "text-blue-600", bg: "bg-blue-50" };
    if (level <= 4) return { text: "MODERATE level", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (level <= 6) return { text: "HIGH level", color: "text-orange-600", bg: "bg-orange-50" };
    return { text: "VERY HIGH level", color: "text-red-600", bg: "bg-red-50" };
  };

  const painDescription = getPainLevelDescription(currentPainLevel);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2FAFA' }}>
      {/* Header with drop shadow */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold text-brand-primary text-center">
            Your Pain Profile
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Gradient Header Bar */}
        <div className="bg-brand-gradient p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <User className="text-brand-primary" size={24} />
              </div>
              <h2 className="text-white text-lg font-semibold">
                {patientData.name}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="text-white" size={20} />
              <span className="text-white font-medium">
                {patientData.ageRange}
              </span>
            </div>
          </div>
        </div>

        {/* Image and Profile Details */}
        <div className="flex flex-col lg:flex-row gap-6 items-start -mt-6">
          <div className="w-full lg:w-32">
            <img 
              src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fe821675-b3a3-4056-debe-0df042380700/public"
              alt="Patient"
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          <ProfileDetails 
            painLocation={profileData.painLocation}
            diagnosis={profileData.diagnosis}
            restrictedMobility={profileData.restrictedMobility}
            painDuration={profileData.painDuration}
            previousMRI={profileData.previousMRI}
          />
        </div>

        {/* Pain Score Section - Redesigned to match reference */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Pain Score Header */}
          <div className="bg-brand-primary text-white px-6 py-4">
            <h3 className="text-xl font-bold">Pain Score</h3>
          </div>

          {/* Pain Details and Scores */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Left side - Pain Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-24">location:</span>
                  <span className="font-semibold">{profileData.painLocation}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-24">Duration:</span>
                  <span className="font-semibold">{profileData.painDuration}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-24">Diagnoses:</span>
                  <span className="font-semibold">{profileData.diagnosis}</span>
                </div>
              </div>

              {/* Right side - Pain Scores */}
              <div className="bg-gray-50 rounded-lg p-4 min-w-[280px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-xs text-gray-600 font-medium">Average Pain</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">8</div>
                    <div className="text-xs text-gray-600 font-medium">Flare-up Pain</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pain Level Indicator */}
            <div className="space-y-4">
              <div className="relative">
                {/* Gradient Bar */}
                <div className="relative h-8 rounded-full overflow-hidden shadow-inner bg-gray-100">
                  <div 
                    className="h-full transition-all duration-2000 ease-out relative"
                    style={{
                      width: `${animatedValue}%`,
                      background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 20%, #10b981 40%, #84cc16 50%, #eab308 65%, #f59e0b 80%, #ef4444 90%, #dc2626 100%)'
                    }}
                  >
                    {/* Animated shimmer effect */}
                    <div 
                      className="absolute inset-0 opacity-30 animate-pulse"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Indicator Circle */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300 transition-all duration-2000 ease-out"
                    style={{
                      left: `calc(${animatedValue}% - 12px)`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  ></div>
                </div>
                
                {/* Scale Labels */}
                <div className="flex justify-between text-xs text-gray-500 font-medium mt-2">
                  <span>LOW</span>
                  <span>MODERATE</span>
                  <span>HIGH</span>
                  <span>VERY HIGH</span>
                </div>
                
                {/* Numeric Scale */}
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
              </div>

              {/* Current Pain Level Alert */}
              <div className={`${painDescription.bg} border-l-4 border-${painDescription.color.split('-')[1]}-400 p-4 rounded-r-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Current Pain Level</div>
                    <div className={`text-lg font-bold ${painDescription.color}`}>
                      {currentPainLevel} - {painDescription.text}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Real-time assessment</div>
                    <div className="text-xs text-gray-400">Updated now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainProfile;
