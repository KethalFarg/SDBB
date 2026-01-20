
import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { ArrowRight, Lock, Phone } from 'lucide-react';

export const PhoneCapture: React.FC = () => {
  const { handleAnswer, nextQuestion, state } = useQuiz();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate short delay
    setTimeout(() => {
        handleAnswer('phone', phone);
        nextQuestion();
    }, 800);
  };

  const zip = state.answers.zip_code || "your area";

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center">
                <Phone size={32} className="text-brand-lightTeal" />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">Analysis Complete</h2>
        <p className="text-white/60 text-center mb-8">
            We found clinical matches for your profile in {zip}. Enter your number to verify you are a real person before we reveal your results.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-2 ml-1">Mobile Number</label>
                <input
                    required
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-xl text-white placeholder:text-white/20 focus:outline-none focus:border-brand-teal transition-colors text-center font-medium"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={phone.length < 10 || loading}
                className="w-full mt-4 py-4 rounded-xl bg-brand-teal hover:bg-brand-lightTeal text-white font-bold text-lg transition-all shadow-lg hover:shadow-brand-teal/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? 'Verifying...' : <>Show My Results <ArrowRight size={20}/></>}
            </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-white/40">
            <Lock size={12} />
            <span>Secure. No spam. Privacy guaranteed.</span>
        </div>
    </div>
  );
};
