
import { User } from "lucide-react";

interface MobilePatientCardProps {
  name: string;
  age: string;
}

const MobilePatientCard = ({ name, age }: MobilePatientCardProps) => {
  return (
    <div className="bg-brand-gradient-horizontal rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <User className="text-brand-primary" size={20} />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white text-lg">{name}</h2>
          <p className="text-white text-sm">Age: {age}</p>
        </div>
      </div>
    </div>
  );
};

export default MobilePatientCard;
