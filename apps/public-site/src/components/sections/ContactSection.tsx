'use client';

import React, { useState } from 'react';
import { leadService } from '@repo/services';

export const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
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
                source: 'contact_page',
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error('Contact form submission failed:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative" id="contact">
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

                    {/* Left: Info */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]/60">Get In Touch</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                                Let&apos;s Talk About <br className="hidden md:block" /> Your <span className="text-[#4F46E5]/80 italic">Future Home.</span>
                            </h2>
                            <p className="text-lg text-slate-400 font-medium max-w-md">
                                Whether you have a specific property in mind or just beginning your journey, our experts are here to help.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#4F46E5] group-hover:border-[#4F46E5]/70 transition-all duration-500">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#4F46E5]/80 mb-1">Call Us Anytime</p>
                                    <a href="tel:+18005550199" className="text-2xl font-black text-white hover:text-[#4F46E5]/60 transition-colors">1-800-555-0199</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#4F46E5] group-hover:border-[#4F46E5]/70 transition-all duration-500">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#4F46E5]/80 mb-1">Email Us Directly</p>
                                    <a href="mailto:hello@squareft.ca" className="text-2xl font-black text-white hover:text-[#4F46E5]/60 transition-colors">hello@squareft.ca</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#4F46E5] group-hover:border-[#4F46E5]/70 transition-all duration-500">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#4F46E5]/80 mb-1">Visit Corporate Office</p>
                                    <p className="text-2xl font-black text-white">123 King St W, Toronto, ON</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl">
                        {isSuccess ? (
                            <div className="text-center space-y-6 py-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thank you! Your inquiry has been sent.</h3>
                                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">
                                    One of our licensed professionals will reach out to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-xs font-black text-[#4F46E5] uppercase tracking-widest hover:text-[#4338CA] transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium text-center animate-[fadeIn_0.3s_ease-out]">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name *</label>
                                        <input
                                            required
                                            id="contact-name"
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#4F46E5]/70 focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address *</label>
                                        <input
                                            required
                                            id="contact-email"
                                            type="email"
                                            placeholder="Email@Example.com"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#4F46E5]/70 focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number *</label>
                                    <input
                                        required
                                        id="contact-phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#4F46E5]/70 focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Message</label>
                                    <textarea
                                        rows={4}
                                        id="contact-message"
                                        placeholder="How can we help you?"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#4F46E5]/70 focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300 resize-none"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    id="contact-submit"
                                    className="w-full h-16 bg-[#4F46E5] hover:bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Inquiry'
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-slate-400 font-medium">
                                    Your inquiry will be directed to one of our licensed local professionals.
                                </p>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};
