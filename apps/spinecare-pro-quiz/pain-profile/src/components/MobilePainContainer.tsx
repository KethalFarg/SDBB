
import PainScoreSlider from "./PainScoreSlider";
import AlertBox from "./AlertBox";
import { PillBottle, Bed } from "lucide-react";

interface MobilePainContainerProps {
  avgPain: number;
  flareUps: number;
}

const MobilePainContainer = ({ avgPain, flareUps }: MobilePainContainerProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-brand-gradient-horizontal text-white px-4 py-2 rounded-r-lg font-bold text-lg -ml-4">
          Pain Score
        </div>

        <div className="border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 bg-gray-50">
          <p>AVG PAIN: <strong className="text-gray-800">{avgPain}</strong></p>
          <p>FLARE-UPS: <strong className="text-gray-800">{flareUps}</strong></p>
        </div>
      </div>

      <PainScoreSlider isMobile={true} />
      
      <div className="mt-4">
        <AlertBox />
      </div>

      {/* Notes and Body Image - Two Columns */}
      <div className="mt-4 flex gap-4">
        {/* Notes Section - Left Column */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-white shadow-md p-2 rounded-lg text-[#2fa2c2]">
              <PillBottle size={14} />
            </div>
            <p className="text-xs text-gray-700">Despite previous efforts, back discomfort still persists without relief.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white shadow-md p-2 rounded-lg text-[#2fa2c2]">
              <Bed size={14} />
            </div>
            <p className="text-xs text-gray-700">Indications that sleep is affected</p>
          </div>
        </div>

        {/* Body Image - Right Column */}
        <div className="flex-shrink-0">
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/f8c0d2ef-91b9-4863-91f7-b6d97952ec00/public" 
            alt="Pain Body Map" 
            className="h-32 object-contain" 
          />
        </div>
      </div>
    </div>
  );
};

export default MobilePainContainer;
