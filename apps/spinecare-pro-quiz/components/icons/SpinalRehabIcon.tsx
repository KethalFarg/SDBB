import React from 'react';

const SpinalRehabIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`relative ${className} select-none flex flex-col items-center justify-center gap-4 sm:gap-6`}>
            <style dangerouslySetInnerHTML={{
                __html: `
            @keyframes slide-infinite {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-wave-target {
                animation: slide-infinite 8s linear infinite;
            }
            .animate-wave-response {
                animation: slide-infinite 10s linear infinite;
            }
            .animate-wave-adjust {
                animation: slide-infinite 12s linear infinite;
            }
            .mask-linear-fade {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
        `}} />

            {/* Main Image: Patient on Table */}
            <div className="relative w-full flex justify-center items-center">
                <img
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/44539b0f-20a6-466d-fda3-7dacef32a900/public"
                    alt="Spinal decompression table"
                    className="w-full max-w-[280px] sm:max-w-[400px] h-auto object-contain opacity-95 drop-shadow-lg"
                />
            </div>

            {/* Animated Wave Dashboard - Compact */}
            <div className="w-full max-w-sm sm:max-w-md relative">
                <div className="w-full h-20 sm:h-24 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2.5 sm:p-3 flex items-center relative overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>

                    {/* Labels - Left Side (reduced gap) */}
                    <div className="flex flex-col justify-center gap-1.5 sm:gap-2 z-20 pr-3 sm:pr-4 border-r border-white/20 min-w-[70px] sm:min-w-[80px]">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-white/60"></div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/60 tracking-wider">FORCE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-white/60"></div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/60 tracking-wider">RESPONSE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-white/60"></div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/60 tracking-wider">ADJUST</span>
                        </div>
                    </div>

                    {/* Waves Container - All equal opacity */}
                    <div className="flex-1 relative h-full flex items-center overflow-hidden mask-linear-fade ml-3 sm:ml-4">
                        {/* Wave 1: Force */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-target">
                            <svg className="w-full h-14" viewBox="0 0 400 60" preserveAspectRatio="none">
                                <path d="M0,30 C50,10 50,50 100,30 C150,10 150,50 200,30 C250,10 250,50 300,30 C350,10 350,50 400,30"
                                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        {/* Wave 2: Response */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-response">
                            <svg className="w-full h-14" viewBox="0 0 400 60" preserveAspectRatio="none">
                                <path d="M0,30 C40,15 60,45 100,30 C140,15 160,45 200,30 C240,15 260,45 300,30 C340,15 360,45 400,30"
                                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 6" />
                            </svg>
                        </div>
                        {/* Wave 3: Adjust */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-adjust">
                            <svg className="w-full h-14" viewBox="0 0 400 60" preserveAspectRatio="none">
                                <path d="M0,30 C30,20 40,40 50,30 C80,20 90,40 100,30 C130,20 140,40 150,30 C180,20 190,40 200,30 
                                  C230,20 240,40 250,30 C280,20 290,40 300,30 C330,20 340,40 350,30 C380,20 390,40 400,30"
                                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                {/* Status indicator */}
                <div className="mt-1.5 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[9px] sm:text-[10px] font-medium text-white/40 tracking-wider">COMPUTER-GUIDED CYCLE ACTIVE</span>
                </div>
            </div>
        </div>
    );
};

export default SpinalRehabIcon;
