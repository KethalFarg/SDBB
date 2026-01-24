import React from 'react';

const ActivityGoalIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/f41779d5-535b-4fc9-78cf-c0f8d46ae600/public"
                alt="What would you like to get back to?"
                className="max-w-full max-h-full object-contain"
            />
        </div>
    );
};

export default ActivityGoalIcon;
