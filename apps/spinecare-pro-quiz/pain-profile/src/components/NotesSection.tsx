
import { PillBottle, Bed } from "lucide-react";

const NotesSection = () => {
  return (
    <div className="absolute bottom-0 left-0 space-y-2">
      <div className="flex items-center gap-3">
        <div className="bg-white shadow-md p-2 rounded-lg text-brand-primary">
          <PillBottle size={16} />
        </div>
        <p className="text-sm text-gray-700">Despite previous efforts, back discomfort still persists without relief.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white shadow-md p-2 rounded-lg text-brand-primary">
          <Bed size={16} />
        </div>
        <p className="text-sm text-gray-700">Indications that sleep is affected</p>
      </div>
    </div>
  );
};

export default NotesSection;
