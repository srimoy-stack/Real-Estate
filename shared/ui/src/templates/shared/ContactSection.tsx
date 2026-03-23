'use client';

import React, { useState } from 'react';

export interface ContactSectionProps {
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    content?: {
        title?: string;
        subtitle?: string;
        email?: string;
        phone?: string;
        address?: string;
    };
}

export const ContactSection: React.FC<ContactSectionProps & { id?: string }> = ({
    variant = 'default',
    id,
    title: titleProp,
    subtitle: subtitleProp,
    email: emailProp,
    phone: phoneProp,
    address: addressProp,
    content,
}) => {
    const title = content?.title || titleProp || 'Get in Touch';
    const subtitle = content?.subtitle || subtitleProp || 'Have questions? Our team is here to help you find the perfect property.';
    const email = content?.email || emailProp || 'contact@realestate.com';
    const phone = content?.phone || phoneProp || '(555) 123-4567';
    const address = content?.address || addressProp || '123 Realty Way, Suite 100, City, State 12345';
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
    };

    if (variant === 'luxury') {
        return (
            <section id={id || 'contact'} className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-950/10 blur-[100px]" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-amber-500" />
                            <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Exquisite Service</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic leading-tight mb-8">
                            {title}
                        </h2>
                        <p className="text-white/50 text-xl font-light leading-relaxed mb-12 max-w-lg">
                            {subtitle}
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <span className="text-white font-medium">{phone}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-white font-medium">{email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[40px] border border-white/5">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest block mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-amber-500 transition-all"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-amber-500 transition-all"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest block mb-2">How can we help?</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-amber-500 transition-all"
                                    placeholder="Tell us about your requirements"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/10">
                                Send Inquiry
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

if (variant === 'corporate') {
    return (
        <section id={id || 'contact'} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{title}</h2>
                        <p className="text-slate-500 mb-10 text-lg leading-relaxed">{subtitle}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Email Us</h4>
                                <p className="text-slate-900 font-bold">{email}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Call Us</h4>
                                <p className="text-slate-900 font-bold">{phone}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Headquarters</h4>
                                <p className="text-slate-900 font-bold">{address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-700 transition-all text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-700 transition-all text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <textarea
                                rows={4}
                                placeholder="Message"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-700 transition-all text-sm"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            <button className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

if (variant === 'minimal') {
    return (
        <section id={id || 'contact'} className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-4xl font-light text-slate-900 tracking-tight mb-8">{title}</h2>
                <div className="h-px w-20 bg-slate-900 mb-12" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <p className="text-slate-400 text-lg leading-relaxed">{subtitle}</p>
                        <div className="space-y-4">
                            <p className="text-slate-900 font-medium">Email: <span className="text-slate-500 ml-2 font-normal">{email}</span></p>
                            <p className="text-slate-900 font-medium">Phone: <span className="text-slate-500 ml-2 font-normal">{phone}</span></p>
                            <p className="text-slate-900 font-medium flex gap-2"><span>Address:</span> <span className="text-slate-500 font-normal">{address}</span></p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full border-b border-slate-200 py-3 outline-none focus:border-slate-900 transition-all text-slate-900"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full border-b border-slate-200 py-3 outline-none focus:border-slate-900 transition-all text-slate-900"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <textarea
                            rows={3}
                            placeholder="How can we help?"
                            className="w-full border-b border-slate-200 py-3 outline-none focus:border-slate-900 transition-all text-slate-900 resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        <button className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mt-4 hover:text-slate-500 hover:border-slate-500 transition-all">
                            Send Message →
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

// Default Variant
return (
    <section id={id || 'contact'} className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-50 -mr-40 -mt-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Connections</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{title}</h2>
                <p className="text-slate-500 leading-relaxed italic">{subtitle}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-slate-900 font-bold">{email}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                            <p className="text-slate-900 font-bold">{phone}</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-5 py-4 bg-slate-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Email</label>
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="w-full px-5 py-4 bg-slate-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Message</label>
                            <textarea
                                rows={4}
                                placeholder="Tell us more..."
                                className="w-full px-5 py-4 bg-slate-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-200">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
);
};
