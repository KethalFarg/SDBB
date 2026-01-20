
import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuiz } from "../../../context/QuizContext";

const AlertBox = () => {
  const { state } = useQuiz();
  const { answers } = state;

  const diagnoses = Array.isArray(answers['diagnosis']) 
    ? answers['diagnosis'].join(' and ').toLowerCase() 
    : 'spinal conditions';
    
  const location = Array.isArray(answers['pain-regions']) 
    ? answers['pain-regions'].join(', ').toLowerCase() 
    : 'lower back';

  const duration = answers['duration'] || 'an extended period';
  const avgPain = answers['avg-pain'] || 6;
  const worstPain = answers['worst-pain'] || 10;

  return (
    <div className="flex-1">
      <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-[#FEE2E2] text-red-600 p-2 rounded-md flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-black text-red-600 uppercase tracking-wide">Significant Clinical Profile</p>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              You've reported {location} pain for {duration}, associated with {diagnoses}. Your pain levels stay steady around {avgPain}/10 and surge to {worstPain}/10 during flare‑ups, pointing to a persistent pattern that warrants further evaluation to prevent potential worsening.
            </p>

            {/* Small separator line */}
            <div className="w-[10%] mt-3 mb-2">
              <Separator className="bg-red-200 h-[2px]" />
            </div>

            {/* Disclaimer text */}
            <p className="text-[10px] text-gray-500 italic font-medium">Based on your responses to a self-assessment quiz; not intended as a formal diagnosis or medical evaluation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
