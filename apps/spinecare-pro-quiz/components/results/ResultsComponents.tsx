import React from 'react';
import { bodyRegions } from '../../utils/scoring';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const DynamicBodyMap: React.FC<{ selected: string[] }> = ({ selected = [] }) => {
    // A simplified SVG representation of a body
    return (
        <div className="relative w-48 h-96 mx-auto">
            <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
                {/* Silhouette - simplified path */}
                <path d="M50,10 C40,10 35,15 35,25 C35,30 30,35 25,35 C20,35 15,40 15,60 L20,100 L25,180 L45,180 L48,130 L52,130 L55,180 L75,180 L80,100 L85,60 C85,40 80,35 75,35 C70,35 65,30 65,25 C65,15 60,10 50,10" 
                      fill="#1a2a35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                
                {/* Highlights */}
                {Object.keys(bodyRegions).map(regionKey => {
                    // Check if this region is in selected list (partial match for Leg(s))
                    // The regionKey might be "Leg(s)_L" but answer is "Leg(s)"
                    const cleanKey = regionKey.replace('_L', '');
                    if (selected.includes(cleanKey)) {
                        const { x, y, size } = bodyRegions[regionKey];
                        return (
                            <g key={regionKey} className="animate-pulse">
                                <circle cx={x} cy={y} r={size/4} fill="rgba(245, 108, 81, 0.4)" filter="blur(4px)" />
                                <circle cx={x} cy={y} r={size/8} fill="rgba(245, 108, 81, 0.8)" />
                            </g>
                        );
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};

export const PainChart: React.FC<{ startPain: number }> = ({ startPain }) => {
    const data = [
        { week: 'Start', pain: startPain },
        { week: 'Wk 2', pain: Math.max(startPain * 0.8, 1) },
        { week: 'Wk 4', pain: Math.max(startPain * 0.5, 1) },
        { week: 'Wk 6', pain: Math.max(startPain * 0.3, 1) },
        { week: 'Wk 8', pain: 2 },
        { week: 'Wk 12', pain: 1 },
    ];

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f56c51" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f56c51" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontSize: 12}} domain={[0, 10]} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a2a35', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="pain" stroke="#f56c51" strokeWidth={3} fillOpacity={1} fill="url(#colorPain)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
