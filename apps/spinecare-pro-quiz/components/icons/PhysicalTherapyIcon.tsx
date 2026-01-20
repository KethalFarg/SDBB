import React from 'react';

export const PhysicalTherapyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/86cd7ec4-0cc1-4091-0903-090cfef09a00/public)',
      maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/86cd7ec4-0cc1-4091-0903-090cfef09a00/public)',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      display: 'inline-block'
    }}
  />
);
