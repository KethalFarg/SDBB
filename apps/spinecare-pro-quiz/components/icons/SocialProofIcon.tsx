import React from 'react';

const SocialProofIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/333e07a8-ce18-4ca7-e67e-e30055317400/public"
                alt="You are not alone"
                className="max-w-full max-h-full object-contain"
                style={{
                    WebkitTransform: 'translateZ(0)',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    background: 'transparent'
                }}
            />
        </div>
    );
};

export default SocialProofIcon;
