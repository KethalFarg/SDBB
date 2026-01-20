import React from 'react';

const SurgeryIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/225e1f33-46a8-4fd2-2bf3-ff4ba277e200/public"
                alt="Surgery isn't the first question"
                className="max-w-[80%] max-h-[80%] object-contain"
            />
        </div>
    );
};

export default SurgeryIcon;
