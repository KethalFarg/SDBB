
import { AlertTriangle } from "lucide-react";
import { Separator } from "./ui/separator";

const AlertBox = () => {
  return (
    <div className="flex-1">
      <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-[#FEE2E2] text-red-600 p-2 rounded-md">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-600">VERY HIGH level</p>
            <p className="text-sm text-gray-700">You've had lower‑back pain radiating down your leg for 3 years, diagnosed as a herniated lumbar disc with sciatica. Despite treatment attempts, your pain stays steady around 6 out of 10 and surges to 10 during flare‑ups, pointing to a chronic nerve‑compression issue that could worsen without focused care.</p>
            
            {/* Small separator line */}
            <div className="w-[2%] mt-3 mb-2">
              <Separator className="bg-gray-400 h-[2px]" />
            </div>
            
            {/* Disclaimer text */}
            <p className="text-xs text-gray-500">Based on your responses to a self-assessment quiz, is not intended as a formal diagnosis or medical evaluation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
