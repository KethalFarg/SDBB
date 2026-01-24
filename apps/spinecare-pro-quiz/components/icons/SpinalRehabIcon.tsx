import React from 'react';

const SpinalRehabIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
    return (
        <div className={`relative ${className} select-none flex flex-col items-center justify-center gap-3`}>
            <style dangerouslySetInnerHTML={{
                __html: `
            @keyframes slide-infinite {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-wave-1 {
                animation: slide-infinite 8s linear infinite;
            }
            .animate-wave-2 {
                animation: slide-infinite 10s linear infinite;
            }
            .animate-wave-3 {
                animation: slide-infinite 12s linear infinite;
            }
            .mask-linear-fade {
                mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }
        `}} />

            {/* Main Image: Patient on Table */}
            <div className="relative w-full flex justify-center items-center">
                <img
                    src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/44539b0f-20a6-466d-fda3-7dacef32a900/public"
                    alt="Spinal decompression table"
                    className="w-full max-w-[260px] sm:max-w-[340px] h-auto object-contain"
                />
            </div>

            {/* Animated Waves - Simple, just lines */}
            <div className="w-full max-w-xs sm:max-w-sm relative h-10 sm:h-12 overflow-hidden mask-linear-fade">
                {/* Wave 1 */}
                <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-1">
                    <svg className="w-full h-10" viewBox="0 0 400 40" preserveAspectRatio="none">
                        <path d="M0,20 C50,5 50,35 100,20 C150,5 150,35 200,20 C250,5 250,35 300,20 C350,5 350,35 400,20"
                            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                {/* Wave 2 */}
                <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-2">
                    <svg className="w-full h-10" viewBox="0 0 400 40" preserveAspectRatio="none">
                        <path d="M0,20 C40,10 60,30 100,20 C140,10 160,30 200,20 C240,10 260,30 300,20 C340,10 360,30 400,20"
                            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
                    </svg>
                </div>
                {/* Wave 3 */}
                <div className="absolute inset-y-0 left-0 w-[200%] flex items-center animate-wave-3">
                    <svg className="w-full h-10" viewBox="0 0 400 40" preserveAspectRatio="none">
                        <path d="M0,20 C30,12 40,28 50,20 C80,12 90,28 100,20 C130,12 140,28 150,20 C180,12 190,28 200,20 
                          C230,12 240,28 250,20 C280,12 290,28 300,20 C330,12 340,28 350,20 C380,12 390,28 400,20"
                            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SpinalRehabIcon;
