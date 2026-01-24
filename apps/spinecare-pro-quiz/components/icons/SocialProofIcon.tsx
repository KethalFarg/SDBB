import React from 'react';

const SocialProofIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className="w-full max-w-xs aspect-[4/3]"
                style={{
                    backgroundColor: 'white',
                    WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/333e07a8-ce18-4ca7-e67e-e30055317400/public)',
                    maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/333e07a8-ce18-4ca7-e67e-e30055317400/public)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain'
                }}
                role="img"
                aria-label="You are not alone"
            />
        </div>
    );
};

export default SocialProofIcon;
