'use client';

import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Message sent! Sarah will get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <section id="contact" className="py-28 bg-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px] opacity-60" />

            <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-10 bg-amber-400" />
                        <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Let&apos;s Connect</span>
                        <div className="h-px w-10 bg-amber-400" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Touch</span>
                    </h2>
                    <p className="text-slate-400 text-lg mt-3 max-w-lg mx-auto">Whether buying, selling, or just exploring — I&apos;m here to help.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your full name"
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(416) 555-0000"
                                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder-slate-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell me about your real estate needs..."
                                    rows={5}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none placeholder-slate-300"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info + Agent Card */}
                    <div className="space-y-8">
                        {/* Agent Card */}
                        <div className="bg-[#0a1628] rounded-3xl p-8 flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-10 h-10 text-amber-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Sarah Mitchell</p>
                                <p className="text-amber-400/60 text-sm">Senior Real Estate Agent</p>
                                <p className="text-white/25 text-xs mt-1">Licensed since 2012 • CREA Member</p>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-4">
                            {[
                                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, label: 'Phone', value: '(416) 555-0101', href: 'tel:4165550101' },
                                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, label: 'Email', value: 'sarah@sarahmitchell.ca', href: 'mailto:sarah@sarahmitchell.ca' },
                                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />, label: 'Office', value: '100 Yorkville Ave, Suite 200, Toronto', href: '#' },
                                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, label: 'Available', value: 'Mon–Sat, 9:00 AM – 7:00 PM', href: '#' },
                            ].map((item) => (
                                <a key={item.label} href={item.href} className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100/50 transition-colors">
                                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-slate-700 font-semibold text-sm mt-0.5">{item.value}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
