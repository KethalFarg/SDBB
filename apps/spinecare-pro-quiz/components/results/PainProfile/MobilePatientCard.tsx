
import { User } from "lucide-react";

interface MobilePatientCardProps {
  name: string;
  age: string;
}

const MobilePatientCard = ({ name, age }: MobilePatientCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-[#F2FAFA] rounded-full flex items-center justify-center border-2 border-[#2ea0bf]/20">
          <User className="text-[#2ea0bf]" size={24} />
        </div>
        <div>
          <h2 className="font-black text-[#031E2C] text-xl uppercase tracking-tight">{name}</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Profile: Active Analysis</p>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
        <span className="text-xs font-black text-gray-400 uppercase mr-2">Age:</span>
        <span className="text-sm font-black text-[#031E2C]">{age}</span>
      </div>
    </div>
  );
};

export default MobilePatientCard;
