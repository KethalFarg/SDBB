import React from 'react';

export const PhysicalTherapyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/aeca1300-616e-414c-3282-9a52ab1da100/public)',
      maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/aeca1300-616e-414c-3282-9a52ab1da100/public)',
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
