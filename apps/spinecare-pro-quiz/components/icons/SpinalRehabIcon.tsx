import React from 'react';

const SpinalRehabIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`relative ${className} select-none flex flex-col items-center justify-center gap-6 md:gap-8`}>
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
                mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            }
        `}} />

            {/* Main Image: Patient on Table - Centered */}
            <div className="relative w-full flex justify-center items-center px-4">
                <div className="absolute inset-0 bg-brand-lightTeal/5 blur-[60px] rounded-full"></div>
                <img
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/44539b0f-20a6-466d-fda3-7dacef32a900/public"
                    alt="Spinal rehabilitation isn't about force"
                    className="w-full max-w-[450px] h-auto object-contain opacity-95 z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 rounded-2xl"
                />
            </div>

            {/* Animated Wave Dashboard - Minimalist, Transparent, White Lines */}
            <div className="w-full max-w-lg relative overflow-visible h-28 flex flex-col items-center px-4 mt-2">
                <div className="w-full h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center relative overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Labels - Left Side */}
                    <div className="flex flex-col justify-center gap-3 z-20 pr-4 border-r border-white/10 min-w-[80px]">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-white"></div>
                            <span className="text-[9px] font-black text-white tracking-widest uppercase opacity-60">Force</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 border-t border-dashed border-white"></div>
                            <span className="text-[9px] font-black text-white tracking-widest uppercase">Response</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 border-t-2 border-dotted border-white/50"></div>
                            <span className="text-[9px] font-black text-white tracking-widest uppercase opacity-40">Adjust</span>
                        </div>
                    </div>

                    {/* Waves Container */}
                    <div className="flex-1 relative h-full flex items-center overflow-hidden mask-linear-fade ml-4">
                        {/* Wave 1: Force (White Solid) */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-target opacity-30">
                            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                                <path d="M0,40 C50,10 50,70 100,40 C150,10 150,70 200,40 C250,10 250,70 300,40 C350,10 350,70 400,40"
                                    fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        {/* Wave 2: Response (White Dashed) */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-response opacity-90">
                            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                                <path d="M0,40 C40,20 60,60 100,40 C140,20 160,60 200,40 C240,20 260,60 300,40 C340,20 360,60 400,40"
                                    fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10 8" />
                            </svg>
                        </div>
                        {/* Wave 3: Adjustments (White Dotted) */}
                        <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-adjust opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                                <path d="M0,40 C30,30 40,50 50,40 C80,30 90,50 100,40 C130,30 140,50 150,40 C180,30 190,50 200,40 
                                  C230,30 240,50 250,40 C280,30 290,50 300,40 C330,30 340,50 350,40 C380,30 390,50 400,40"
                                    fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 4" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                {/* Micro-label for dashboard */}
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-lightTeal animate-pulse"></div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Computer-Guided Cycle Active</span>
                </div>
            </div>
        </div>
    );
};
};

export default SpinalRehabIcon;
