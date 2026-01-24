import React from 'react';

const SurgeryIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className="w-[65%] aspect-square"
                style={{
                    backgroundColor: 'white',
                    WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/225e1f33-46a8-4fd2-2bf3-ff4ba277e200/public)',
                    maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/225e1f33-46a8-4fd2-2bf3-ff4ba277e200/public)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain'
                }}
                role="img"
                aria-label="Surgery isn't the first question"
            />
        </div>
    );
};

export default SurgeryIcon;
