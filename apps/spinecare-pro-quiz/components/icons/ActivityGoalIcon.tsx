import React from 'react';

const ActivityGoalIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/b9183ff8-a801-4a0b-0a56-48e572ce4400/public"
                alt="What would you like to get back to?"
                className="max-w-full max-h-full object-contain"
            />
        </div>
    );
};

export default ActivityGoalIcon;
