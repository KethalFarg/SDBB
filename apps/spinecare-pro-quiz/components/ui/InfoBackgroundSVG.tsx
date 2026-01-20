import React from 'react';

interface Props {
    className?: string;
}

export const InfoBackgroundSVG: React.FC<Props> = ({ className = "" }) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 1920 1080'
                className="w-full h-full object-cover"
                preserveAspectRatio="xMidYMid slice"
            >
                <rect fill='#014B5C' width='1920' height='1080' />
                <defs>
                    <rect id='a' width='105' height='3000' y='-1000'></rect>
                </defs>
                <g transform='rotate(0 960 540)'>
                    <use href='#a' x='-200'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='0' repeatCount='999'></animate></use>
                    <use href='#a' x='-100'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-.25' repeatCount='999'></animate></use>
                    <use href='#a'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-.5' repeatCount='999'></animate></use>
                    <use href='#a' x='100'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-.75' repeatCount='999'></animate></use>
                    <use href='#a' x='200'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-1' repeatCount='999'></animate></use>
                    <use href='#a' x='300'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-1.25' repeatCount='999'></animate></use>
                    <use href='#a' x='400'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-1.5' repeatCount='999'></animate></use>
                    <use href='#a' x='500'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-1.75' repeatCount='999'></animate></use>
                    <use href='#a' x='600'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-2' repeatCount='999'></animate></use>
                    <use href='#a' x='700'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-2.25' repeatCount='999'></animate></use>
                    <use href='#a' x='800'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-2.5' repeatCount='999'></animate></use>
                    <use href='#a' x='900'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-2.75' repeatCount='999'></animate></use>
                    <use href='#a' x='1000'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-3' repeatCount='999'></animate></use>
                    <use href='#a' x='1100'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-3.25' repeatCount='999'></animate></use>
                    <use href='#a' x='1200'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-3.5' repeatCount='999'></animate></use>
                    <use href='#a' x='1300'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-3.75' repeatCount='999'></animate></use>
                    <use href='#a' x='1400'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-4' repeatCount='999'></animate></use>
                    <use href='#a' x='1500'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-4.25' repeatCount='999'></animate></use>
                    <use href='#a' x='1600'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-4.5' repeatCount='999'></animate></use>
                    <use href='#a' x='1700'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-4.75' repeatCount='999'></animate></use>
                    <use href='#a' x='1800'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-5' repeatCount='999'></animate></use>
                    <use href='#a' x='1900'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-5.25' repeatCount='999'></animate></use>
                    <use href='#a' x='2000'><animate attributeName='fill' calcMode='spline' values='#014B5C;#1A7285;#1A7285;#014B5C;#014B5C' keySplines='.5 0 .5 1;.5 0 .5 1;.5 0 .5 1;0 0 1 1' dur='12s' begin='-5.5' repeatCount='999'></animate></use>
                </g>
            </svg>
        </div>
    );
};
