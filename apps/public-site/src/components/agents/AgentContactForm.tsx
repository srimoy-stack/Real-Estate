'use client';

import React, { useState } from 'react';
import { leadService } from '@repo/services';

interface AgentContactFormProps {
    agentName: string;
    agentId: string;
}

export const AgentContactForm: React.FC<AgentContactFormProps> = ({ agentName, agentId }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: `Hi ${agentName}, I'm interested in learning more about your services.`,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = (): string | null => {
        if (!formData.name.trim()) return 'Please enter your name.';
        if (!formData.email.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address.';
        if (!formData.phone.trim()) return 'Please enter your phone number.';
        if (formData.phone.replace(/\D/g, '').length < 7) return 'Phone number seems too short.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            await leadService.createLead({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
                source: 'agent_profile',
                agentId,
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error('Failed to submit inquiry:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 italic">
                Get in <span className="text-[#4F46E5]">Touch</span>
            </h3>
            <p className="text-slate-500 font-medium mb-8">
                Fill out the form below and {agentName.split(' ')[0]} will get back to you shortly.
            </p>

            {isSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-black text-emerald-900 mb-2">Thank you! Your inquiry has been sent.</h4>
                    <p className="text-emerald-700 font-medium text-sm">
                        {agentName.split(' ')[0]} will reach out to you shortly.
                    </p>
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="mt-6 text-sm font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium text-center animate-[fadeIn_0.3s_ease-out]">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</label>
                            <input
                                required
                                type="text"
                                id="agent-lead-name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number *</label>
                            <input
                                required
                                type="tel"
                                id="agent-lead-phone"
                                placeholder="(555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address *</label>
                        <input
                            required
                            type="email"
                            id="agent-lead-email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                        <textarea
                            rows={4}
                            id="agent-lead-message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none resize-none"
                        />
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        id="agent-lead-submit"
                        className="w-full py-5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-95 group overflow-hidden relative"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Message Now'
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#a01318] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <p className="text-[10px] text-center text-slate-400 font-medium">
                        By submitting, you agree to our{' '}
                        <a href="/privacy" className="text-[#4F46E5]/80 hover:underline">Privacy Policy</a>
                        {' '}and{' '}
                        <a href="/terms" className="text-[#4F46E5]/80 hover:underline">Terms of Service</a>.
                    </p>
                </form>
            )}
        </div>
    );
};
