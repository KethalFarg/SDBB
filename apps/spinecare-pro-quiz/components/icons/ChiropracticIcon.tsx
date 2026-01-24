import React from 'react';

export const ChiropracticIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <div 
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/787c781a-f1c4-463d-75f7-63fd59e42500/public)',
      maskImage: 'url(https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/787c781a-f1c4-463d-75f7-63fd59e42500/public)',
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
