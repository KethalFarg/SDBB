import React from 'react';

const StandingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/f0b458b8-2a00-421b-3286-f0b458b82a00/public)',
      maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/f0b458b8-2a00-421b-3286-f0b458b82a00/public)',
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

export default StandingIcon;
