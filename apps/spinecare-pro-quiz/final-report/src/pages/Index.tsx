
import Header from '../components/Header';
import PatientScore from '../components/PatientScore';
import StickyBottomSection from '../components/StickyBottomSection';
import { Badge } from '../components/ui/badge';
import { Target, Clock, MapPin, Brain, Lightbulb, Gift, Unlock, Armchair, User, Footprints, Package, Car } from 'lucide-react';

const Index = () => {
  const score = 86;
  const patientName = "Sarah Johnson";
  const joint = "Low Back Pain & Radiculopathy";
  const outlook = "Good";
  
  // Sample chart data for recovery progress
  const chartData = [
    { name: 'Week 1', value: 30 },
    { name: 'Week 2', value: 45 },
    { name: 'Week 3', value: 60 },
    { name: 'Week 4', value: 75 },
    { name: 'Week 6', value: 85 },
    { name: 'Week 8', value: 90 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        score={score} 
        patientName={patientName}
        joint={joint}
        outlook={outlook}
        chartData={chartData}
      />
      
      {/* Mobile-only Estimated Treatment Metrics section */}
      <div className="lg:hidden bg-white w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-black text-center mb-4">
            Estimated Treatment Metrics
          </h2>
          
          {/* Patient name with icon */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-teal-primary rounded-full p-2 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-teal-primary font-medium text-sm">Sarah Johnson</span>
          </div>
          
          {/* Gray circle with knee image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Rounded square with light blue gradient */}
              <div 
                className="w-80 h-80 rounded-3xl shadow-lg flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100"
              >
                {/* Image centered and slightly smaller with rounded corners */}
                <img 
                  src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/ad0f01ca-8029-4e90-560c-791e9f07e300/public"
                  alt="Treatment illustration"
                  className="w-64 h-64 object-contain rounded-2xl"
                />
              </div>
            </div>
            
            {/* Knee tag underneath */}
            <div className="mt-4 mb-8">
              <Badge 
                className="bg-gray-600 text-white px-3 py-1 text-sm font-medium hover:bg-gray-700"
              >
                LOW BACK
              </Badge>
            </div>

            {/* Treatment metric boxes */}
            <div className="w-full max-w-md space-y-4">
              {/* Rectangle 1 - Estimated Results */}
              <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {/* Teal circle with icon */}
                  <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text content */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Estimated Results</h3>
                    <p className="text-sm text-gray-600">60-80% pain reduction in 4 to 6 sessions</p>
                  </div>
                </div>
              </div>

              {/* Rectangle 2 - Treatment Time */}
              <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {/* Teal circle with icon */}
                  <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text content */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Treatment Time</h3>
                    <p className="text-sm text-gray-600">15-20 minutes each</p>
                  </div>
                </div>
              </div>

              {/* Rectangle 3 - Travel Distance */}
              <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {/* Teal circle with icon */}
                  <div className="bg-teal-primary rounded-full p-3 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text content */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Travel Distance</h3>
                    <p className="text-sm text-gray-600">Location near - (zipcode)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only section with #F2FAFA background */}
      <div className="lg:hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8" style={{ backgroundColor: '#F2FAFA' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-black text-center mb-4">
            Estimated Activity Improvement
          </h2>
          
          {/* Patient name with icon */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-teal-primary rounded-full p-2 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-teal-primary font-medium text-sm">Sarah Johnson</span>
          </div>
          
          {/* Mobile-friendly bar graph container */}
          <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
            <div className="h-64 flex items-end justify-center gap-3 relative">
              {/* Y-axis line */}
              <div className="absolute left-4 top-4 bottom-16 w-px bg-gray-300"></div>
              
              {/* X-axis line */}
              <div className="absolute left-4 bottom-16 right-4 h-px bg-gray-300"></div>
              
              {/* Y-axis label */}
              <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90">
                <span className="text-sm font-medium text-gray-600">Improvement</span>
              </div>
              
              {/* Animated bars - mobile optimized */}
              <div className="flex items-end gap-2 h-full pt-8 pl-8 pb-16">
                <div className="w-8 rounded-t" style={{ height: '40%', backgroundColor: '#B6D8EA' }}></div>
                <div className="w-8 rounded-t" style={{ height: '55%', backgroundColor: '#F2D28E' }}></div>
                <div className="w-8 rounded-t" style={{ height: '70%', backgroundColor: '#FFB170' }}></div>
                <div className="w-8 rounded-t" style={{ height: '85%', backgroundColor: '#FF7F5E' }}></div>
                <div className="w-8 rounded-t" style={{ height: '90%', backgroundColor: '#2ea0bf' }}></div>
              </div>
            </div>
          </div>

          {/* Legend underneath */}
          <div className="space-y-3">
            {/* Sitting */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#B6D8EA' }}>
                <Armchair size={16} className="text-white" />
              </div>
              <span className="text-gray-600 font-medium text-sm">Sitting</span>
            </div>

            {/* Standing */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2D28E' }}>
                <User size={16} className="text-white" />
              </div>
              <span className="text-gray-600 font-medium text-sm">Standing</span>
            </div>

            {/* Walking */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFB170' }}>
                <Footprints size={16} className="text-white" />
              </div>
              <span className="text-gray-600 font-medium text-sm">Walking</span>
            </div>

            {/* Bending / Lifting */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF7F5E' }}>
                <Package size={16} className="text-white" />
              </div>
              <span className="text-gray-600 font-medium text-sm">Bending / Lifting</span>
            </div>

            {/* Driving */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2ea0bf' }}>
                <Car size={16} className="text-white" />
              </div>
              <span className="text-gray-600 font-medium text-sm">Driving</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only section with teal gradient */}
      <div className="lg:hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8">
        <div className="bg-gradient-to-r from-[#323743] to-teal-primary px-4 py-8">
          {/* AI Analysis header with logo */}
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3">
              {/* Animation container positioned behind the brain logo */}
              <div className="loader-container">
                <div className="square" id="sq1"></div>
                <div className="square" id="sq2"></div>
                <div className="square" id="sq3"></div>
                <div className="square" id="sq4"></div>
                <div className="square" id="sq5"></div>
                <div className="square" id="sq6"></div>
                <div className="square" id="sq7"></div>
                <div className="square" id="sq8"></div>
                <div className="square" id="sq9"></div>
              </div>
              
              <h3 className="text-lg font-semibold text-white">
                AI Summary
              </h3>
            </div>
          </div>

          {/* Glass pane stretched closer to edges */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/70 p-6 shadow-md mx-1">
            <div className="text-gray-800 leading-relaxed">
              <p className="mb-4">
                <strong>{patientName}</strong>,
              </p>
              <p className="mb-4">
                Your treatment metrics show excellent potential for rapid results within just a little over a few sessions.
              </p>
              <p className="mb-4">
                This is not out of the norm. Pulsewave therapy works by creating an optimal healing environment around your low back, naturally mobilizing your body's stem cells to the treatment area. This typically leads to lasting improvement in mobility issues like bending, lifting, and prolonged sitting or standing.
              </p>
              <p>
                Because you are a good candidate you qualify for a trial treatment, see the details below to get on the road to recovery and better mobility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New mobile-only white section */}
      <div className="lg:hidden bg-white w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Recommended Next Steps Section */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Teal circle with white fill and teal lightbulb icon */}
            <div className="bg-white border-2 border-teal-primary rounded-full p-3 flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-teal-primary" />
            </div>
            <h2 className="text-2xl font-bold text-black">
              Recommended Next Steps
            </h2>
          </div>
          
          {/* Content with rounded rectangle border */}
          <div className="text-center border-2 border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-teal-primary font-bold mb-4" style={{ fontSize: '1.62rem' }}>
              Initial consultation
            </h3>
            <p className="text-black">
              Comprehensive evaluation of your condition and medical history to identify your specific needs. <span className="text-teal-primary">(unlocked treatment)</span>
            </p>
          </div>

          {/* This includes text */}
          <p className="text-black mb-6">This includes:</p>

          {/* Mobile-friendly stacked numbered boxes */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="rounded-lg shadow-lg overflow-hidden">
              {/* Top section with light gray background and circle */}
              <div className="h-20 flex items-center justify-start pl-4" style={{ backgroundColor: '#EEF1F2' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#323743] to-teal-primary flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">Diagnostic Mapping</h3>
                </div>
              </div>
              
              {/* Bottom section with solid teal background */}
              <div className="bg-teal-primary p-4">
                <p className="text-white font-bold" style={{ fontSize: '1.15rem' }}>Comprehensive evaluation of your condition and medical history to identify your specific needs.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg shadow-lg overflow-hidden">
              {/* Top section with light gray background and circle */}
              <div className="h-20 flex items-center justify-start pl-4" style={{ backgroundColor: '#EEF1F2' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#323743] to-teal-primary flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">Trial Treatment</h3>
                </div>
              </div>
              
              {/* Bottom section with solid teal background */}
              <div className="bg-teal-primary p-4">
                <p className="text-white font-bold" style={{ fontSize: '1.15rem' }}>Experience the treatment first-hand with your first targeted treatment session</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg shadow-lg overflow-hidden">
              {/* Top section with light gray background and circle */}
              <div className="h-20 flex items-center justify-start pl-4" style={{ backgroundColor: '#EEF1F2' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#323743] to-teal-primary flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">Personalized Plan</h3>
                </div>
              </div>
              
              {/* Bottom section with solid teal background */}
              <div className="bg-teal-primary p-4">
                <p className="text-white font-bold" style={{ fontSize: '1.15rem' }}>Custom treatment schedule based on your specific needs to achieve optimal pain reduction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New mobile-only gray gradient section */}
      <div className="lg:hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-16 pb-24 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-800">You've Unlocked a Special New Patient Package</h2>
              <div className="bg-gray-100 rounded-full p-3 shadow-lg">
                <Unlock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <p className="text-lg text-gray-600">Schedule your trial treatment today</p>
          </div>
        </div>

        {/* Dark backdrop container - edge to edge */}
        <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-2xl">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* Mobile-optimized content container */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
              
              {/* Icons section */}
              <div className="flex justify-center items-center gap-6 mb-6">
                <div className="bg-gray-100 rounded-full p-4 shadow-lg">
                  <Gift className="w-12 h-12 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-full p-4 shadow-lg">
                  <Unlock className="w-12 h-12 text-gray-600" />
                </div>
              </div>

              {/* Content */}
              <div className="text-white text-center space-y-4">
                <h3 className="text-2xl font-bold mb-4">Special New Patient Package</h3>
                <p className="text-lg mb-6">Start your recovery journey with our comprehensive introductory package</p>
                
                {/* Pricing Container */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-lg text-white/70 line-through">Normally $297</span>
                    <span className="text-4xl font-bold text-white">$79</span>
                  </div>
                  
                  {/* Package Includes */}
                  <div className="text-left">
                    <h4 className="font-semibold text-white mb-3 text-center">Package Includes:</h4>
                    <ul className="space-y-2 text-white/90">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                        <span>Comprehensive consultation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                        <span>Diagnostic evaluation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                        <span>Trial treatment session</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                        <span>Personalized treatment plan</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Footer text */}
                <p className="text-sm text-white/70">
                  Limited spots available. Schedule your consultation today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <PatientScore />
      </div>
      <StickyBottomSection />
    </div>
  );
};

export default Index;
