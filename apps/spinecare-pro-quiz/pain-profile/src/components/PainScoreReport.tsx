
import Header from "./Header";
import PatientHeader from "./PatientHeader";
import PainScoreSlider from "./PainScoreSlider";
import PainDetails from "./PainDetails";
import AlertBox from "./AlertBox";
import NotesSection from "./NotesSection";
import MobilePatientCard from "./MobilePatientCard";
import MobilePainDetails from "./MobilePainDetails";
import MobilePainContainer from "./MobilePainContainer";
import MobileMovementLifestyle from "./MobileMovementLifestyle";
import MobileAISummary from "./MobileAISummary";
import MobilityImpactIndex from "./MobilityImpactIndex";
import StickyReportButton from "./StickyReportButton";
import { Check } from "lucide-react";

const PainScoreReport = () => {
  const avgPain = 6;
  const flareUps = 10;

  return (
    <>
      <Header />
      {/* Desktop Version - Hidden on mobile */}
      <div className="hidden md:block bg-[#F2FAFA] p-8 min-h-screen pt-24 pb-32">
        <div className="max-w-6xl mx-auto">
          <PatientHeader name="Sarah Johnson" ageRange="40-49" />

          {/* Main Container */}
          <div className="bg-gray-100 rounded-b-xl shadow-md p-8 relative">
            {/* Top Row: Pain Score Tag and AVG PAIN/FLARE-UPS Box */}
            <div className="flex justify-between items-start mb-2">
              <div className="bg-brand-gradient-horizontal text-white px-6 py-3 rounded-r-lg font-bold text-xl -ml-8">
                Pain Score
              </div>

              <div className="border border-gray-300 rounded-lg px-6 py-3 text-sm text-gray-500 bg-gray-50">
                <p>AVG PAIN: <strong className="text-gray-800">{avgPain}</strong></p>
                <p>FLARE-UPS: <strong className="text-gray-800">{flareUps}</strong></p>
              </div>
            </div>

            <PainDetails />

            {/* Main Content Area */}
            <div className="flex gap-8 relative">
              {/* Left Column */}
              <div className="flex-1 space-y-3">
                <PainScoreSlider />

                {/* Alert Box and Body Image Container */}
                <div className="flex gap-4 items-start">
                  <AlertBox />

                  {/* Body Diagram */}
                  <div className="flex-shrink-0">
                    <img 
                      src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/704fbd3b-2340-40e2-5101-5e8ae360ec00/public" 
                      alt="Pain Body Map" 
                      className="h-64 object-contain" 
                    />
                  </div>
                </div>
              </div>

              <NotesSection />
            </div>
          </div>

          {/* Movement & Lifestyle Container */}
          <div className="bg-gray-100 rounded-xl shadow-md p-8 relative mt-6">
            <div className="relative -ml-8 mb-2">
              <div className="bg-brand-gradient-horizontal text-white px-6 py-3 rounded-r-lg font-bold text-xl inline-block">
                Movement & Lifestyle
              </div>
            </div>
            
            <MobilityImpactIndex severity="severe" score="5/5" />
          </div>

          {/* AI Summary Container */}
          <div className="bg-gray-100 rounded-xl shadow-md p-8 relative mt-6">
            <div className="relative -ml-8 mb-6">
              <div className="bg-brand-gradient-horizontal text-white px-6 py-3 rounded-r-lg font-bold text-xl inline-flex items-center gap-3">
                <div className="ai-loader">
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
                AI Summary
              </div>
            </div>
            
            {/* Three Column Layout with visual elements */}
            <div className="flex gap-16 relative min-h-[200px]">
              {/* Vertical line spanning full height with extended top and bottom */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-16 bottom-0 w-px bg-gray-400" style={{height: 'calc(100% + 100px)'}}></div>
              
              {/* Left Column with connecting line and text box */}
              <div className="flex-1 relative">
                {/* Connecting line from center circle to left text box */}
                <div className="absolute top-1/2 right-0 w-24 h-px bg-gray-400 transform -translate-y-1/2 z-20"></div>
                
                {/* Left text box */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg relative z-30">
                  <h3 className="text-brand-primary font-semibold text-lg mb-4">
                    In your assesment you indicated:
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-500 rounded-full w-4 h-4 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      </div>
                      <span className="text-gray-700 text-sm">
                        You've tried treatments like medication or PT, but the pain persists.
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-red-500 rounded-full w-4 h-4 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      </div>
                      <span className="text-gray-700 text-sm">
                        It's making you feel older than you are.
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-red-500 rounded-full w-4 h-4 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      </div>
                      <span className="text-gray-700 text-sm">
                        It's frustrating physically and emotionally.
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-red-500 rounded-full w-4 h-4 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      </div>
                      <span className="text-gray-700 text-sm">
                        Sleep is likely being disrupted.
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="rounded-full w-4 h-4 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(46,160,191,0.6)]" style={{ backgroundColor: '#2ea0bf' }}>
                      </div>
                      <span className="text-gray-700 text-sm">
                        Your top priority is returning to activity and independence.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Smaller Separator Image with higher z-index */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                <div className="bg-gray-100 p-3 rounded-full border-2 border-gray-300 shadow-lg">
                  <img 
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/5a03ac7a-5dea-4fa3-4813-069e04284d00/public" 
                    alt="Separator" 
                    className="w-32 h-32 object-contain" 
                  />
                </div>
              </div>

              {/* Right Column with connecting line and text box - pushed in by ~15% */}
              <div className="flex-1 relative pl-12">
                {/* Connecting line from center circle to right text box */}
                <div className="absolute top-1/2 left-0 w-24 h-px bg-gray-400 transform -translate-y-1/2 z-20"></div>
                
                {/* Right text box */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg relative z-30">
                  <h3 className="font-bold text-lg mb-2">
                    Profile Summary
                  </h3>
                  
                  <p className="text-brand-primary text-sm mb-4">
                    Ready for submission
                  </p>
                  
                  <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                      <p>
                        You've reported chronic lower back pain with leg pain (radiculopathy) from herniated disc and sciatica, with limited mobility, disrupted daily function, and a history of minimal results from prior treatments. The severity and 3-year duration suggest a condition that may be progressive, with increasing impact over time.
                      </p>
                    
                    <p className="border border-[#2ea0bf] bg-gray-50 p-3 rounded-lg">
                      The next step is to analyze your responses to determine how closely your case aligns with successful outcomes — and whether this approach may offer a viable path forward.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Visible only on mobile */}
      <div className="md:hidden bg-[#F2FAFA] min-h-screen pt-20 pb-32">
        <div className="p-4 space-y-4">
          <MobilePatientCard name="Sarah Johnson" age="40 - 49" />
          <MobilePainDetails />
          <MobilePainContainer avgPain={avgPain} flareUps={flareUps} />
          <MobileMovementLifestyle />
          <MobileAISummary />
        </div>
      </div>

      {/* Sticky Report Button - Visible on both desktop and mobile */}
      <StickyReportButton />
    </>
  );
};

export default PainScoreReport;
