import React from 'react';

const SpinalRehabIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`relative ${className} select-none flex flex-col items-center justify-center gap-4`}>
            <style dangerouslySetInnerHTML={{
                __html: `
            @keyframes slide-infinite {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-wave-target {
                animation: slide-infinite 12s linear infinite;
            }
            .animate-wave-response {
                animation: slide-infinite 14s linear infinite;
            }
            .animate-wave-adjust {
                animation: slide-infinite 16s linear infinite;
            }
        `}} />

            {/* Main Image: Patient on Table - Centered */}
            <img
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/44539b0f-20a6-466d-fda3-7dacef32a900/public"
                alt="Spinal rehabilitation isn't about force"
                className="w-[85%] h-auto object-contain opacity-90 z-10"
            />

            {/* Animated Wave Dashboard - Minimalist, Transparent, White Lines */}
            <div className="w-[90%] relative overflow-visible h-24 flex items-center mt-2">

                {/* Labels - Absolute Left */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center gap-2 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-white opacity-90"></div>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase opacity-90">Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 border-t border-dashed border-white opacity-90"></div>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase opacity-90">Response</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 border-t-2 border-dotted border-white opacity-90"></div>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase opacity-90">Adjust</span>
                    </div>
                </div>

                {/* Waves Container */}
                <div className="flex-1 relative h-full flex items-center ml-24 overflow-hidden mask-linear-fade">
                    {/* Wave 1: Target (White Solid) - High Amplitude Smooth */}
                    <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-target opacity-90">
                        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                            <path d="M0,40 C50,-10 50,90 100,40 C150,-10 150,90 200,40 C250,-10 250,90 300,40 C350,-10 350,90 400,40"
                                fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    {/* Wave 2: Response (White Dashed) - High Amplitude Lagging */}
                    <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-response opacity-70">
                        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                            <path d="M0,40 C40,10 60,70 100,40 C140,10 160,70 200,40 C240,10 260,70 300,40 C340,10 360,70 400,40"
                                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 6" />
                        </svg>
                    </div>
                    {/* Wave 3: Adjustments (White Dotted) - High Amplitude Variance */}
                    <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-adjust opacity-50">
                        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                            <path d="M0,40 C30,20 40,60 50,40 C80,20 90,60 100,40 C130,20 140,60 150,40 C180,20 190,60 200,40 
                              C230,20 240,60 250,40 C280,20 290,60 300,40 C330,20 340,60 350,40 C380,20 390,60 400,40"
                                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpinalRehabIcon;
