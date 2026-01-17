import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Quote, MapPin, Search, Activity, CheckCircle2, Play, Plus, Minus, ShieldCheck, ClipboardList, MapPinIcon, BarChart3, CreditCard, Phone, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-10 left-0 right-0 bg-white/95 backdrop-blur-md z-50 py-1 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center flex-shrink-0 cursor-pointer group">
            <img 
              src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fd74b3aa-c3d4-4188-fd65-604349f96400/public" 
              alt="Spinal Decompression Logo" 
              className="h-14 w-auto object-contain transition-transform group-hover:scale-[1.02] duration-300"
            />
          </div>

          <nav className="hidden xl:flex items-center space-x-8">
            {[
              { label: 'Spinal Decompression', hasArrow: true },
              { label: 'Conditions', hasArrow: false },
              { label: 'Results & Evidence', hasArrow: true },
              { label: 'Cost & Care', hasArrow: true },
              { label: 'Locations', hasArrow: false },
              { label: 'About', hasArrow: true }
            ].map((item, idx) => (
              <a 
                key={idx}
                href="#" 
                className="text-gray-600 hover:text-[#014c5d] font-semibold text-[14px] flex items-center gap-1.5 transition-all duration-200"
              >
                {item.label}
                {item.hasArrow && <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
              </a>
            ))}
          </nav>

          <div className="flex-shrink-0">
            <button className="bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white px-8 py-3 rounded-full font-bold text-[15px] hover:shadow-xl transition-all duration-300 shadow-md shadow-[#014c5d]/10">
              Book Online
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fbd93e83-3826-43b1-448f-e3ec73b18900/public" 
          alt="Happy couple on beach" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-20">
        <div className="max-w-[850px]">
          <h1 className="text-[56px] lg:text-[82px] font-bold text-[#014c5d] leading-[1.02] tracking-tight mb-8">
            Relief Without Surgery — Based on What the Evidence Shows
          </h1>
          
          <p className="text-[22px] lg:text-[24px] text-gray-800 leading-relaxed mb-12 max-w-[680px] font-medium">
            Modern spinal decompression is designed to address disc-related back and neck pain through protocols aligned with clinical research.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <button className="bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white px-12 py-5 rounded-full font-bold text-[20px] hover:shadow-2xl transition-all duration-300 shadow-xl shadow-[#014c5d]/20 active:scale-[0.98]">
              Start Assessment
            </button>
            <button className="bg-white/90 backdrop-blur-sm text-[#014c5d] border-2 border-[#014c5d]/20 px-12 py-5 rounded-full font-bold text-[20px] hover:bg-white transition-all duration-300 shadow-sm active:scale-[0.98]">
              Find a Provider
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCarousel = () => {
  const testimonials = [
    { text: "Since my Spinal Decompression treatment, I have felt stronger and I no longer experience the sciatic pain from nerves being pinched off. I am active again.", author: "Phillip", location: "Sciatica & Disc Herniation", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/dcd5d0cf-3b55-4ce3-dba5-732041ea3200/public" },
    { text: "As far as my back is concerned, it feels better right now than it has in 50 years. About a year ago it got to the point where I had trouble getting in and out of bed.", author: "David", location: "Chronic Low Back Pain", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/c1d762dc-5737-4a4a-520d-2452904e2800/public" },
    { text: "I was told surgery was my only option. Decompression saved me from going under the knife. I can pick up my grandkids again without fear.", author: "Callie", location: "Bulging Disc", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/0e734708-0d88-4571-e6ba-cfbc281d2b00/public" }
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => { setActiveIndex((prev) => (prev + 1) % testimonials.length); }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative w-full h-[450px] flex items-center justify-center group">
      {/* Background Aura Glow using logo color #0496b0 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[300px] bg-[#0496b0]/15 rounded-full blur-[100px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>

      {testimonials.map((t, idx) => {
        const isCurrent = idx === activeIndex;
        const isPrev = idx === (activeIndex - 1 + testimonials.length) % testimonials.length;
        const isNext = idx === (activeIndex + 1) % testimonials.length;
        return (
          <div key={idx} className={`absolute w-full max-w-[420px] transition-all duration-1000 ease-in-out transform ${isCurrent ? 'opacity-100 translate-x-0 scale-100 z-30' : isPrev ? 'opacity-0 -translate-x-full scale-95 z-10' : isNext ? 'opacity-40 translate-x-12 scale-95 z-20 translate-y-4 rotate-2' : 'opacity-0 translate-x-full z-0'}`}>
            <div className="relative">
              {/* Geometric corner accents for the active card */}
              {isCurrent && (
                <>
                  <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[#0496b0] rounded-tr-[32px] z-0 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-[#0496b0] rounded-bl-[32px] z-0 opacity-40 group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform duration-500"></div>
                </>
              )}
              
              <div className="relative bg-white p-8 rounded-[32px] shadow-2xl shadow-[#014c5d]/10 border border-gray-50 flex flex-col gap-6 z-10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-[#014c5d]/5 rounded-full flex items-center justify-center"><Quote className="text-[#014c5d] w-6 h-6 fill-current opacity-20" /></div>
                <p className="text-[19px] leading-relaxed text-gray-700 font-medium italic">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#014c5d]/10 shadow-md flex-shrink-0">
                    <img src={t.image} alt={t.author} className="w-full h-full object-cover" />
                  </div>
                  <div><p className="font-bold text-[#014c5d]">{t.author}</p><p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{t.location}</p></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ComparisonSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-[640px]">
            <h2 className="text-[44px] lg:text-[54px] font-bold text-[#014c5d] leading-[1.08] mb-8 tracking-tight">Not All Spinal Decompression Is the Same — <span className="font-medium">And Here’s Why It Matters</span></h2>
            <p className="text-[20px] lg:text-[22px] text-gray-700 font-semibold mb-6 leading-relaxed">Clinical studies show significant variability in decompression equipment, protocols, and provider training.</p>
            <p className="text-[19px] lg:text-[20px] text-gray-600 mb-10 leading-[1.6]">Our Preferred Provider network uses research-aligned technology and evidence-based protocols to ensure you receive care that matches what the studies actually demonstrate.</p>
            <a href="#" className="inline-flex items-center gap-2 text-[#f2674b] font-bold text-[18px] tracking-wide hover:gap-4 transition-all group uppercase">SEE CLINICAL STANDARDS <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></a>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#014c5d]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#014c5d]/3 rounded-full blur-2xl"></div>
            <TestimonialCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

const UnifiedProcessSection = () => {
  return (
    <section className="bg-[#f0f9fa] py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-32">
        <div className="bg-[#f8fafb] rounded-[48px] p-12 lg:p-20 shadow-2xl shadow-[#014c5d]/5 border border-[#014c5d]/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-[42px] lg:text-[48px] font-bold text-[#014c5d] leading-[1.1] mb-4 tracking-tight">See If There's a Preferred Provider Near You</h2>
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/a5f726ad-956d-4f72-6a7d-3414c929c100/public" 
                alt="Nationwide provider network" 
                className="w-full max-w-[400px] h-auto mb-8 rounded-2xl"
              />
              <div className="w-24 h-1 bg-[#0496b0]/40 rounded-full mb-8"></div>
              <p className="text-[20px] text-gray-600 leading-relaxed mb-8">Not every clinic meets our standards. Enter your zip code to check if a credentialed provider is available in your area.</p>
              <div className="flex items-center gap-4 text-[#014c5d] font-bold text-lg"><div className="w-2 h-2 rounded-full bg-[#014c5d]"></div><span>Nationwide Network of Certified Clinics</span></div>
            </div>
            <div className="bg-white p-8 lg:p-10 rounded-[32px] border-[3px] border-[#014c5d] shadow-[inset_0_4px_25px_rgba(1,76,93,0.04),0_20px_40px_rgba(1,76,93,0.05)]">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#014c5d] uppercase tracking-wider mb-2">First Name</label>
                    <input type="text" placeholder="John" className="w-full px-5 py-4 rounded-full border border-[#014c5d]/30 bg-white shadow-sm focus:border-[#014c5d] outline-none text-gray-700 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#014c5d] uppercase tracking-wider mb-2">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full px-5 py-4 rounded-full border border-[#014c5d]/30 bg-white shadow-sm focus:border-[#014c5d] outline-none text-gray-700 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#014c5d] uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-5 py-4 rounded-full border border-[#014c5d]/30 bg-white shadow-sm focus:border-[#014c5d] outline-none text-gray-700 transition-all" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#014c5d] uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <input type="tel" placeholder="(555) 000-0000" className="w-full pl-12 pr-5 py-4 rounded-full border border-[#014c5d]/30 bg-white shadow-sm focus:border-[#014c5d] outline-none text-gray-700 transition-all" />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#014c5d] uppercase tracking-wider mb-2">Zip Code</label>
                    <div className="relative">
                      <input type="text" placeholder="Enter Zip Code" className="w-full pl-12 pr-5 py-4 rounded-full border border-[#014c5d]/30 bg-white shadow-sm focus:border-[#014c5d] outline-none text-gray-700 transition-all" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="sms-consent" 
                      className="peer appearance-none w-5 h-5 border-2 border-[#014c5d]/30 rounded bg-white checked:bg-[#014c5d] checked:border-[#014c5d] cursor-pointer transition-all"
                    />
                    <CheckCircle2 className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity p-0.5" />
                  </div>
                  <label htmlFor="sms-consent" className="text-[12px] leading-relaxed text-gray-500 cursor-pointer select-none">
                    By checking this box, I agree to be contacted via phone or text (SMS) by SpinalDecompression.com or participating providers with information about spine-specific rehabilitation services, provider availability, and appointment scheduling at this phone number using automated technology. I understand that consent is not a condition of receiving care, and that message and data rates may apply. Msg freq varies. I also understand I may reply "STOP" to opt out and "HELP" for help. <a href="#" className="text-[#f2674b] font-bold hover:underline">View our Privacy Policy and Terms of Use</a>. This site is protected by reCAPTCHA and the Google <a href="#" className="text-[#f2674b] font-bold hover:underline">Privacy Policy</a> and <a href="#" className="text-[#f2674b] font-bold hover:underline">Terms of Service</a> apply.
                  </label>
                </div>

                <button className="w-full bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white py-5 rounded-full font-bold text-[18px] hover:shadow-xl transition-all duration-300 shadow-lg shadow-[#014c5d]/10 mt-4">Find Your Provider</button>
              </form>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl group">
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/08537307-c8c4-433b-187e-a76fad764a00/public" 
                alt="Patient receiving spinal care" 
                className="w-full h-full object-cover aspect-[3/4] lg:aspect-auto lg:min-h-[700px] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-start pt-6">
                {/* Edge-to-Edge Medical Waveforms */}
                <svg className="w-full h-48" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <defs>
                    {/* Define the base wave patterns for seamless looping */}
                    <path id="wave-solid" d="M0,50 C50,0 150,100 200,50 C250,0 350,100 400,50 C450,0 550,100 600,50 C650,0 750,100 800,50 C850,0 950,100 1000,50" />
                    <path id="wave-dashed" d="M0,50 C40,10 60,90 100,50 C140,10 160,90 200,50 C240,10 260,90 300,50 C340,10 360,90 400,50 C440,10 460,90 500,50 C540,10 560,90 600,50 C640,10 660,90 700,50 C740,10 760,90 800,50 C840,10 860,90 900,50 C940,10 960,90 1000,50" />
                    <path id="wave-dotted" d="M0,50 C25,20 75,80 100,50 C125,20 175,80 200,50 C225,20 275,80 300,50 C325,20 375,80 400,50 C425,20 475,80 500,50 C525,20 575,80 600,50 C625,20 675,80 700,50 C725,20 775,80 800,50 C825,20 875,80 900,50 C925,20 975,80 1000,50" />
                  </defs>

                  {/* Layer 1: Solid Wave (Primary Tension) */}
                  <g>
                    <use href="#wave-solid" x="0" y="0" fill="none" stroke="white" strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-400 0" dur="10s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-solid" x="400" y="0" fill="none" stroke="white" strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-400 0" dur="10s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-solid" x="800" y="0" fill="none" stroke="white" strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-400 0" dur="10s" repeatCount="indefinite" />
                    </use>
                  </g>

                  {/* Layer 2: Dashed Wave (Target Force) - Different speed/frequency */}
                  <g>
                    <use href="#wave-dashed" x="0" y="0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="10,8">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="15s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-dashed" x="200" y="0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="10,8">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="15s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-dashed" x="400" y="0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="10,8">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="15s" repeatCount="indefinite" />
                    </use>
                  </g>

                  {/* Layer 3: Dotted Wave (Biofeedback) - Faster and more jittery */}
                  <g>
                    <use href="#wave-dotted" x="0" y="0" fill="none" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="2,6">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-100 0" dur="5s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-dotted" x="100" y="0" fill="none" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="2,6">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-100 0" dur="5s" repeatCount="indefinite" />
                    </use>
                    <use href="#wave-dotted" x="200" y="0" fill="none" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="2,6">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-100 0" dur="5s" repeatCount="indefinite" />
                    </use>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-[44px] lg:text-[54px] font-bold text-[#014c5d] leading-[1.1] mb-4 tracking-tight">How Spinal Decompression Works</h2>
            <div className="w-32 h-1.5 bg-[#0496b0] rounded-full mb-8"></div>
            <p className="text-[20px] lg:text-[22px] text-gray-700 leading-relaxed mb-6 font-medium">Spinal decompression reduces mechanical loading on discs and nerves through controlled, computer-guided protocols. By altering the spinal environment, it may reduce intradiscal pressure and nerve compression while improving tolerance to movement and supporting the body's adaptive processes.</p>
            <p className="text-[19px] lg:text-[20px] text-gray-600 leading-relaxed mb-8">This approach is designed to restore function, reduce pain, and support return to daily activities in appropriately selected patients.</p>
            <div className="mb-10">
              <p className="text-[18px] font-bold text-[#0496b0] mb-5 uppercase tracking-wider">Commonly addressed conditions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                {["Herniated and bulging discs", "Sciatica and radiating pain", "Degenerative disc disease", "Facet syndrome", "Post-surgical rehabilitation (select cases)"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#014c5d]/60" /><span className="text-[17px] text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-center"><button className="bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white px-10 py-4 rounded-full font-bold text-[18px] hover:shadow-xl transition-all shadow-lg shadow-[#014c5d]/10">How it Works</button><a href="#" className="inline-flex items-center gap-2 text-[#f2674b] font-bold text-[18px] tracking-wide hover:gap-4 transition-all group uppercase">SEE ALL CONDITIONS <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></a></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PatientStoriesSection = () => {
  return (
    <section className="bg-gradient-to-r from-[#014c5d] to-[#176c80] py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        <h2 className="text-[44px] lg:text-[54px] font-bold text-white leading-[1.1] mb-12 tracking-tight max-w-4xl text-capitalize">What to expect with a preferred provider</h2>
        <div className="relative w-full max-w-4xl group">
          <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/10">
            <img src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/3882f2b2-e583-41d3-8645-aabdb02bb200/public" alt="Patient Video Story" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" /><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <button className="absolute inset-0 flex items-center justify-center group/btn"><div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:btn:scale-110 transition-transform duration-300"><Play className="text-[#014c5d] w-10 h-10 fill-current ml-1" /></div></button>
          </div>
          <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div><div className="absolute -z-10 -top-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <p className="text-[18px] text-white/60 mt-10 font-medium tracking-wide">REAL STORIES. REAL RESULTS.</p>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [expanded, setExpanded] = useState(false);
  const mainQuestions = [
    { title: "How spinal decompression works", text: "Spinal decompression uses computer-guided protocols to reduce pressure on discs and nerves. Plans vary based on diagnosis and response to care.", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/c7eebeba-69d0-4b8c-8714-f70042df3200/public" },
    { title: "Who is a candidate for spinal decompression?", text: "Spinal decompression uses computer-guided protocols to reduce pressure on discs and nerves. Plans vary based on diagnosis and response to care.", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/b01c5eaa-7ad3-46d3-fabb-92e634a43900/public" },
    { title: "How long do treatment plans take?", text: "Spinal decompression uses computer-guided protocols to reduce pressure on discs and nerves. Plans vary based on diagnosis and response to care.", image: "https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/10c97acc-a075-4147-b937-ca61c746f600/public" }
  ];
  const expandedQuestions = [
    { title: "Will This Work for My Condition?", text: "Spine-specific rehabilitation may help herniated discs, sciatica, and nerve-related pain—but isn't appropriate for everyone. Understand candidacy before pursuing care.", link: "Explore Conditions" },
    { title: "What Kind of Results Can I Expect?", text: "Clinical studies demonstrate that outcomes depend on patient selection, equipment quality, and protocol adherence. See what research shows—and what it doesn't.", link: "View Evidence & Research" },
    { title: "Is This Safe for Someone Like Me?", text: "Spinal decompression is generally well-tolerated when delivered using proper protocols. Understand who should—and shouldn't—pursue this approach.", link: "Safety & Contraindications" }
  ];
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-[44px] lg:text-[54px] font-bold text-[#014c5d] leading-[1.1] mb-6 tracking-tight">Common Questions About Spinal Decompression</h2>
          <p className="text-[20px] text-gray-600 leading-relaxed font-medium">We know all of this information can feel quite overwhelming and you're going to have a lot of questions. That's why our experts explain it all as simply as possible right here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainQuestions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="aspect-[16/10] overflow-hidden relative bg-[#f0fafa] flex items-center justify-center">
                <img 
                  src={q.image} 
                  alt={q.title} 
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="p-8 flex flex-col flex-grow"><h3 className="text-[22px] font-bold text-[#014c5d] leading-tight mb-4">{q.title}</h3><p className="text-gray-600 leading-relaxed mb-8">{q.text}</p><button className="mt-auto text-[#f2674b] font-bold text-[16px] flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-transparent hover:border-[#f2674b] w-fit pb-1 uppercase tracking-wide">Read More <ChevronRight className="w-4 h-4" /></button></div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-full grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100 mt-8 mb-16' : 'max-h-0 opacity-0'}`}>
            {expandedQuestions.map((q, idx) => (
              <div key={idx} className="p-8 rounded-[32px] border-2 border-[#014c5d]/10 bg-white hover:border-[#014c5d]/30 transition-all group"><h3 className="text-[22px] font-bold text-[#014c5d] leading-tight mb-4">{q.title}</h3><p className="text-gray-600 leading-relaxed mb-8">{q.text}</p><button className="text-[#f2674b] font-bold text-[16px] flex items-center gap-2 transition-all group-hover:gap-3 transition-all uppercase tracking-wide">{q.link} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></div>
            ))}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 bg-transparent border-2 border-[#014c5d] text-[#014c5d] px-10 py-4 rounded-full font-bold text-[18px] hover:bg-[#014c5d] hover:text-white transition-all duration-300 shadow-lg shadow-[#014c5d]/5 active:scale-95">{expanded ? <>Show Fewer Questions <Minus className="w-5 h-5" /></> : <>See More Questions <Plus className="w-5 h-5" /></>}</button>
        </div>
      </div>
    </section>
  );
};

const StandardOfCareSection = () => {
  const features = [
    { title: "Standards Define Outcomes", text: "Equipment quality, protocol design, and provider training determine results more than the therapy itself.", btnText: "Why Standards Matter", icon: ShieldCheck },
    { title: "Condition-Specific Guidance", text: "Spine-specific rehabilitation works better for some conditions than others. Understand where you fit.", btnText: "Is This Right for Me?", icon: ClipboardList },
    { title: "Qualified Local Care", text: "Find providers in your area who meet our equipment and training requirements.", btnText: "Find a Provider", icon: MapPinIcon },
    { title: "Defined Treatment Structure", text: "Care plans are designed around reaching maximum therapeutic improvement—not indefinite maintenance.", btnText: "Total Relief Care Plan", icon: BarChart3 }
  ];
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-r from-[#014c5d] to-[#176c80] relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]"></div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center relative z-10">
        <h2 className="text-[44px] lg:text-[54px] font-bold text-white mb-6 tracking-tight">A Higher Standard of Care</h2>
        <p className="text-[20px] text-white/80 max-w-3xl mx-auto mb-20 font-medium">We're on a mission to bring transparency, clinical excellence, and predictable outcomes to spinal decompression therapy.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[32px] flex flex-col items-center group transition-all duration-300">
              <div className="w-16 h-16 bg-[#f0f9fa] rounded-2xl flex items-center justify-center mb-8"><f.icon className="w-8 h-8 text-[#014c5d]" /></div>
              <h3 className="text-[22px] font-bold text-[#014c5d] mb-4 leading-tight">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed text-[16px] mb-10 flex-grow">{f.text}</p>
              <button className="w-full py-4 px-6 rounded-full border-2 border-[#014c5d] text-[#014c5d] font-bold text-[15px] hover:bg-[#014c5d] hover:text-white transition-all duration-300 uppercase tracking-wider">{f.btnText}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdvisoryBoardSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-[600px]">
            <h2 className="text-[48px] lg:text-[64px] font-bold text-[#014c5d] leading-[1.05] mb-6 tracking-tight">Built on Clinical Standards, Not Marketing</h2>
            <div className="w-20 h-1.5 bg-[#0496b0] rounded-full mb-8"></div>
            <p className="text-[20px] lg:text-[22px] text-[#014c5d] font-bold mb-8 uppercase tracking-wide">Guided by MDs, NPs, and Experienced Practitioners</p>
            <p className="text-[19px] lg:text-[21px] text-gray-600 leading-relaxed mb-10">While chiropractors, physical therapists, and medical doctors don't always agree on treatment approaches, those who have used proper decompression protocols acknowledge its effectiveness relative to its favorable risk profile.</p>
            <a href="#" className="text-[#f2674b] font-bold text-[18px] border-b-2 border-[#f2674b] pb-1 hover:text-[#d14f36] hover:border-[#d14f36] transition-all uppercase tracking-wide">See Clinical Advisory Board</a>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#014c5d] rounded-[40px] transform translate-y-12 -rotate-1 opacity-[0.03]"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-[#014c5d] rounded-[40px] z-0"><div className="absolute inset-0 bg-gradient-to-br from-[#014c5d] to-[#003d4a] rounded-[40px]"></div><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-[40px]"></div></div>
            <div className="relative z-10 pt-12 px-8 flex flex-col items-center">
              <img src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/ffd6f323-2389-4ead-fd9d-0337e3314700/public" alt="Medical Advisory Board" className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)]" />
              <div className="w-full bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl mt-[-20px] relative z-20 border border-gray-100 flex flex-col gap-1 max-w-[550px]">
                <p className="text-[15px] font-bold text-[#014c5d]">Robert Odell, MD, PhD, Stanford alumnus (Preferred Provider, Las Vegas)</p>
                <p className="text-[15px] text-gray-500 font-medium">David Levinson, DC, PGA medical staff (Preferred Provider, Alpharetta, Georgia)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const OneCostSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto self-stretch relative overflow-hidden"><img src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/b400e163-225e-4d94-e264-f2190df15900/public" alt="Couple discussing their care plan" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-[#014c5d]/5"></div></div>
          <div className="w-full lg:w-1/2 p-12 lg:p-20 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-[#f0f9fa] rounded-xl flex items-center justify-center mb-8"><CreditCard className="w-6 h-6 text-[#014c5d]" /></div>
            <h2 className="text-[42px] lg:text-[52px] font-bold text-[#014c5d] leading-[1.1] mb-4 tracking-tight">One Cost, Clear Endpoint</h2>
            <div className="w-24 h-1 bg-[#0496b0]/60 rounded-full mb-8"></div>
            <p className="text-[19px] lg:text-[21px] text-gray-600 leading-relaxed mb-10 font-medium">Only our Preferred Providers offer the Total Relief Care Plan™—one flat investment covering corrective care until you reach maximum therapeutic improvement.</p>
            <button className="bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white px-10 py-5 rounded-full font-bold text-[18px] hover:shadow-2xl transition-all duration-300 shadow-xl shadow-[#014c5d]/20 active:scale-95">Total Relief Care Plan</button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PatientQuotesSection = () => {
  const quotes = [
    { text: "Everyone was professional and made me feel comfortable. The sessions were gentle and well-explained.", author: "ANIKA, TAMPA FL" },
    { text: "I noticed steady improvement with each visit. The team was attentive and the clinic was clean.", author: "CHRIS, LOS ANGELES CA" },
    { text: "Clear plan, supportive staff, and measurable progress. I felt in good hands.", author: "JEN, DENVER CO" }
  ];
  return (
    <section className="bg-gradient-to-r from-[#014c5d] to-[#176c80] py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <h2 className="text-[20px] font-bold text-white mb-12 uppercase tracking-[0.1em] opacity-90">What our patients say about their spinal decompression care</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quotes.map((q, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-[32px] flex flex-col justify-between hover:bg-white/15 transition-all duration-300 group"><p className="text-white text-[19px] leading-relaxed italic mb-8 font-medium opacity-95 group-hover:opacity-100 transition-opacity">"{q.text}"</p><p className="text-white font-bold text-[14px] uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">{q.author}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
};

const renderWavePattern = (strokeColor = "#176c80", opacity = 0.2) => {
  const lines = [];
  const totalLines = 100;
  const spacing = 12;
  const width = 1600;
  const wavelength = 120;
  const amplitude = 25;
  for (let i = 0; i < totalLines; i++) {
      const yBase = i * spacing;
      let currentX = -wavelength;
      let d = `M ${currentX} ${yBase}`;
      d += ` Q ${currentX + wavelength / 4} ${yBase - amplitude} ${currentX + wavelength / 2} ${yBase}`;
      currentX += wavelength / 2;
      while (currentX < width + wavelength) {
          currentX += wavelength / 2;
          d += ` T ${currentX} ${yBase}`;
      }
      lines.push(<path key={i} d={d} vectorEffect="non-scaling-stroke" />);
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" className={`w-full h-full opacity-${opacity}`} preserveAspectRatio="none" style={{ opacity: opacity }}>
      <g fill="none" stroke={strokeColor} strokeWidth="1">{lines}</g>
    </svg>
  );
};

const LocationSearchSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="bg-[#031E2C] rounded-[48px] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="absolute inset-0 z-0">
            {renderWavePattern("#176c80", 0.4)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#031E2C] via-[#031E2C]/80 to-transparent z-0"></div>
          
          <div className="relative z-10 max-w-2xl text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-6">
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fdd5f772-73a3-4208-fd11-f03e2a90eb00/public" 
                alt="Preferred Provider Seal" 
                className="w-24 h-24 lg:w-32 lg:h-32 object-contain"
              />
              <h2 className="text-[44px] lg:text-[56px] font-bold text-white leading-[1.1]">Find a Preferred Provider</h2>
            </div>
            <p className="text-white/60 text-[19px] leading-relaxed">Enter your zip code to see if a credentialed provider is available near you.</p>
          </div>
          <div className="relative z-10 w-full max-w-md"><div className="relative group"><input type="text" placeholder="Enter ZIP/Postal Code or State" className="w-full pl-8 pr-16 py-6 rounded-full bg-white text-gray-900 text-lg shadow-xl focus:ring-4 focus:ring-[#014c5d]/30 transition-all outline-none" /><button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white p-4 rounded-full hover:shadow-lg active:scale-95 group-hover:scale-105 duration-300"><Search className="w-6 h-6" /></button></div></div>
        </div>
      </div>
    </section>
  );
};

const FinalCTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-[600px]">
            <h2 className="text-[48px] lg:text-[64px] font-bold text-[#014c5d] leading-[1.05] mb-6 tracking-tight">Two Ways to Explore Further</h2>
            <div className="w-24 h-1.5 bg-[#0496b0] rounded-full mb-8"></div>
            <p className="text-[19px] lg:text-[21px] text-gray-600 leading-relaxed mb-10 font-medium">Take a short assessment to see if spinal decompression may be appropriate for your situation. Or find a preferred provider to schedule an evaluation when you're ready.</p>
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <button className="bg-gradient-to-r from-[#004b5c] to-[#176c80] text-white px-10 py-5 rounded-full font-bold text-[19px] hover:shadow-xl transition-all active:scale-95">Start Assessment</button>
              <a href="#" className="text-[#f2674b] font-bold text-[18px] flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-wide">Or find a provider near you <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></a>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] group">
              {/* Primary aesthetic accent: Large soft glow using the logo color #0496b0 */}
              <div className="absolute -inset-8 bg-[#0496b0]/20 rounded-full blur-[80px] opacity-60 group-hover:opacity-90 transition-opacity duration-1000 pointer-events-none"></div>
              
              {/* Geometric corner frame accents using the logo color #0496b0 */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-[3px] border-r-[3px] border-[#0496b0] rounded-tr-[48px] z-0 opacity-40 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-[3px] border-l-[3px] border-[#0496b0] rounded-bl-[48px] z-0 opacity-40 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>

              {/* Offset shadow layers */}
              <div className="absolute inset-0 bg-[#014c5d]/5 rounded-[40px] transform rotate-3 scale-105 blur-sm"></div>
              <div className="absolute inset-0 bg-[#0496b0]/5 rounded-[40px] transform -rotate-2 scale-102"></div>
              
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/e334624a-e767-4321-2441-f406959e6700/public" 
                alt="Medical practitioner" 
                className="relative z-10 w-full h-auto rounded-[40px] shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700 border-4 border-white/50 backdrop-blur-sm" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WaveBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#031E2C]">
      {renderWavePattern("#176c80", 0.2)}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-24"></div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="relative w-full pt-32 pb-12 overflow-hidden border-t border-gray-100">
      <WaveBackground />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-left">
          <div className="flex flex-col gap-6">
            <img src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/d6d1306d-faaa-4903-087c-83f8d2c0bf00/public" className="h-12 w-fit" alt="Official Logo" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">Leading the way in evidence-based spinal decompression and non-surgical rehabilitation.</p>
          </div>
          <div>
            <h4 className="text-[#f2674b] font-bold mb-6 uppercase tracking-[0.15em] text-[13px]">Resources</h4>
            <ul className="flex flex-col gap-4">
              {['Conditions', 'Results & Evidence', 'Cost & Care', 'Locations', 'About'].map(link => (
                <li key={link}><a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#f2674b] font-bold mb-6 uppercase tracking-[0.15em] text-[13px]">Legal</h4>
            <ul className="flex flex-col gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Medical Disclaimer'].map(link => (
                <li key={link}><a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#f2674b] font-bold mb-6 uppercase tracking-[0.15em] text-[13px]">Connect</h4>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">Stay updated with the latest in spinal health and clinical research.</p>
            <div className="flex gap-5">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Youtube, href: "#" }
              ].map(({ Icon, href }, idx) => (
                <a key={idx} href={href} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#f2674b] hover:border-[#f2674b] text-white/40 hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-xs uppercase tracking-[0.2em] font-bold">© 2026 Spinal Decompression Medical Network. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="relative w-full min-h-screen bg-white font-sans selection:bg-[#014c5d]/20 selection:text-[#014c5d]">
      
      {/* 1. TOP STICKY BANNER */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-[#f2674b] text-white flex items-center justify-center text-[11px] sm:text-[13px] font-black tracking-[0.2em] z-[200] shadow-md uppercase">
        Site Currently Updating — System Preview Mode
      </div>

      {/* 2. GLASS OVERLAY (Visual only) */}
      {/* This creates the "behind glass" look but pointer-events-none lets the browser still handle scroll */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[100] pointer-events-none" />

      {/* 3. MAIN CONTENT (Interactions Disabled) */}
      <div className="pointer-events-none select-none">
        <Header />
        <main className="w-full">
          {/* Padding top to account for the fixed header + banner */}
          <div className="pt-10">
            <Hero />
            <ComparisonSection />
            <UnifiedProcessSection />
            <PatientStoriesSection />
            <FAQSection />
            <StandardOfCareSection />
            <AdvisoryBoardSection />
            <OneCostSection />
            <PatientQuotesSection />
            <LocationSearchSection />
            <FinalCTASection />
          </div>
        </main>
        <Footer />
        
        {/* Spacer for bottom banner */}
        <div className="h-24 bg-transparent" />
      </div>

      {/* 4. BOTTOM STICKY BAR (Interactive) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#031E2C] border-t border-white/10 py-4 px-6 z-[200] flex flex-col sm:flex-row items-center justify-center gap-4 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f2674b] animate-pulse"></div>
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Are you a provider?</span>
        </div>
        <a 
          href="https://portal.spinaldecompression.com" 
          className="pointer-events-auto bg-gradient-to-r from-[#004b5c] to-[#176c80] hover:from-[#f2674b] hover:to-[#f2674b] text-white px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-lg border border-white/10"
        >
          Access Provider Portal
        </a>
      </div>

    </div>
  );
}

export default App;
