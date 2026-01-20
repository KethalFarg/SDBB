
const MobilePainDetails = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Pain location:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-2">Lower back, Leg Pain</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Diagnoses:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-2">Herniated Disc, Sciatica</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Pain duration:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-2">3 years</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium text-[#2fa2c2]">Previous MRI:</span>
          <span className="text-gray-900 text-sm text-left flex-1 ml-2">Yes</span>
        </div>
      </div>
    </div>
  );
};

export default MobilePainDetails;
