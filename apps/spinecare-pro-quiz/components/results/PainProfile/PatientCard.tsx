
import { Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PatientCardProps {
  name: string;
  ageRange: string;
}

const PatientCard = ({ name, ageRange }: PatientCardProps) => {
  return (
    <Card className="bg-gray-200 border-0 shadow-lg p-4 w-full lg:w-80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
            <User className="text-white" size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {name}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-300 px-3 py-2 rounded-md">
          <Calendar size={18} className="text-gray-600" />
          <span className="font-medium text-gray-700">
            {ageRange}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;
