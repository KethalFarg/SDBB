import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Lock } from 'lucide-react';
import { QUIZ_CONFIG } from '../../constants';

export const NameEmailCapture: React.FC = () => {
    const { handleAnswer, nextQuestion, state } = useQuiz();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [zipCode, setZipCode] = useState(state.answers.zip_code || '');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get theme
    const config = QUIZ_CONFIG.find(q => q.id === state.currentStepId);
    const isLight = config?.theme === 'light';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) return;
        setLoading(true);
        // Simulate short delay
        setTimeout(() => {
            handleAnswer('firstName', firstName);
            handleAnswer('lastName', lastName);
            handleAnswer('email', email);
            handleAnswer('zip_code', zipCode);
            nextQuestion();
        }, 800);
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-black text-[#031E2C] text-center mb-2 tracking-tight leading-tight">
                Let's start your spinaldecompression.com profile
            </h2>
            <p className="text-center mb-8 text-sm sm:text-base text-gray-500 font-medium">
                Please answer with complete and accurate information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        required
                        type="text"
                        placeholder="First Name*"
                        className="w-full rounded-full px-6 py-4 border-2 border-[#031E2C]/80 text-[#031E2C] placeholder:text-gray-400 focus:outline-none focus:border-[#0590a8] font-medium"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <input
                        required
                        type="text"
                        placeholder="Last Name*"
                        className="w-full rounded-full px-6 py-4 border-2 border-[#031E2C]/80 text-[#031E2C] placeholder:text-gray-400 focus:outline-none focus:border-[#0590a8] font-medium"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                </div>

                <input
                    required
                    type="email"
                    placeholder="Email Address*"
                    className="w-full rounded-full px-6 py-4 border-2 border-[#031E2C]/80 text-[#031E2C] placeholder:text-gray-400 focus:outline-none focus:border-[#0590a8] font-medium"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    required
                    type="text"
                    pattern="[0-9]*"
                    maxLength={5}
                    placeholder="Zip Code*"
                    className="w-full rounded-full px-6 py-4 border-2 border-[#031E2C]/80 text-[#031E2C] placeholder:text-gray-400 focus:outline-none focus:border-[#0590a8] font-medium"
                    value={zipCode}
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setZipCode(val);
                    }}
                />

                <div className="flex gap-3 mt-6">
                    <div className="pt-1">
                        <input
                            required
                            type="checkbox"
                            id="terms"
                            className="w-5 h-5 rounded border-gray-300 text-[#004B5C] focus:ring-[#004B5C]"
                            checked={acceptedTerms}
                            onChange={e => setAcceptedTerms(e.target.checked)}
                        />
                    </div>
                    <label htmlFor="terms" className="text-[10px] leading-relaxed text-gray-500 font-medium">
                        By checking this box, I agree to be contacted via phone or text (SMS) by SpinalDecompression.com or participating providers with information about spine-specific rehabilitation services, provider availability, and appointment scheduling at this phone number using automated technology. I understand that consent is not a condition of receiving care, and that message and data rates may apply. Msg freq varies. I also understand I may reply "STOP" to opt out and "HELP" for help. <a href="#" className="underline font-bold text-gray-700">View our Privacy Policy and Terms of Use</a>. This site is protected by reCAPTCHA and the Google <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Service</a> apply.
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={!firstName || !lastName || !email || !zipCode || !acceptedTerms || loading}
                    className="w-full mt-6 py-5 rounded-full bg-[#004B5C] hover:bg-[#003845] text-white font-black text-xl tracking-wider transition-all shadow-[0_10px_20px_rgba(0,75,92,0.2)] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                    {loading ? 'Processing...' : 'Get Started'}
                </button>
            </form>
        </div>
    );
};
