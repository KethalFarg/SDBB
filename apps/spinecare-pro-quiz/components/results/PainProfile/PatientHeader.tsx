
import { User, Calendar } from "lucide-react";

interface PatientHeaderProps {
  name: string;
  ageRange: string;
}

const PatientHeader = ({ name, ageRange }: PatientHeaderProps) => {
  return (
    <div className="bg-header-gradient rounded-t-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <User className="text-brand-primary" size={24} />
        </div>
        <span className="text-white font-semibold text-lg">{name}</span>
      </div>
      
      <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-md">
        <Calendar size={18} className="text-white" />
        <span className="text-white font-medium">{ageRange}</span>
      </div>
    </div>
  );
};

export default PatientHeader;
