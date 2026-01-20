import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Lock } from 'lucide-react';

export const SoftEntryForm: React.FC = () => {
  const { handleAnswer, nextQuestion } = useQuiz();
  const [formData, setFormData] = useState({ first: '', last: '', email: '' });
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    
    handleAnswer('firstName', formData.first);
    handleAnswer('lastName', formData.last);
    handleAnswer('email', formData.email);
    
    // Simulate API call delay if needed
    nextQuestion();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-bold text-white text-center mb-2">Let's Create Your Report</h2>
      <p className="text-white/60 text-center text-sm mb-6">
        We'll customize your results based on clinical data.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/70 mb-1 ml-1">First Name</label>
          <input
            required
            type="text"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
            value={formData.first}
            onChange={e => setFormData({...formData, first: e.target.value})}
          />
        </div>
        <div>
            <label className="block text-xs text-white/70 mb-1 ml-1">Last Name</label>
            <input
                required
                type="text"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
                value={formData.last}
                onChange={e => setFormData({...formData, last: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-xs text-white/70 mb-1 ml-1">Email Address</label>
            <input
                required
                type="email"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
        </div>

        <div className="flex items-start gap-3 mt-4">
            <input 
                type="checkbox" 
                id="consent" 
                checked={consent} 
                onChange={e => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
            />
            <label htmlFor="consent" className="text-xs text-white/50 leading-relaxed">
                I agree to receive my report and related information. We respect your privacy and data security. <Lock size={10} className="inline ml-1"/>
            </label>
        </div>

        <button
            type="submit"
            disabled={!consent}
            className="w-full mt-6 py-4 rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white font-bold text-lg transition-all shadow-lg hover:shadow-brand-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Generate My Report
        </button>
      </form>
    </div>
  );
};
