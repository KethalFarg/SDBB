import React from 'react';

export const ChiropracticIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/82ea3c91-9bf7-4d89-eba8-d9a595b93f00/public)',
      maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/82ea3c91-9bf7-4d89-eba8-d9a595b93f00/public)',
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
