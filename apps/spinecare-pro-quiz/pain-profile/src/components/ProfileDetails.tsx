
import { Card } from "@/components/ui/card";

interface ProfileDetailsProps {
  painLocation: string;
  diagnosis: string;
  restrictedMobility: string;
  painDuration: string;
  previousMRI: string;
}

const ProfileDetails = ({ 
  painLocation, 
  diagnosis, 
  restrictedMobility, 
  painDuration,
  previousMRI
}: ProfileDetailsProps) => {
  const details = [
    { label: "pain location", value: painLocation },
    { label: "Diagnoses", value: diagnosis },
    { label: "Restricted Mobility", value: restrictedMobility },
    { label: "Pain Duration", value: painDuration },
    { label: "Previous MRI", value: previousMRI }
  ];

  return (
    <Card className="bg-white border-2 border-teal-400 shadow-lg p-6 flex-1 min-w-0">
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="font-medium text-gray-700 text-sm">
              {detail.label}
            </span>
            <span className="text-gray-900 font-semibold">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProfileDetails;
