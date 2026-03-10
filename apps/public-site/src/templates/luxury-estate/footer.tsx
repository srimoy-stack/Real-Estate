'use client';

import React from 'react';

export const LuxuryFooter: React.FC = () => (
    <footer className="bg-slate-950 relative overflow-hidden">
        {/* Top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        {/* Newsletter Section */}
        <div className="border-b border-white/5">
            <div className="max-w-[1400px] mx-auto px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-amber-400/60 text-[11px] font-black uppercase tracking-[0.4em]">Stay Informed</span>
                        <h3 className="text-3xl font-black text-white tracking-tighter mt-3">
                            Exclusive Market <span className="text-amber-400 italic">Insights</span>
                        </h3>
                        <p className="text-white/30 text-sm mt-3 max-w-md">Receive curated listings, market analysis, and exclusive invitations to private viewings before they go public.</p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 px-6 py-4 bg-white/5 border border-white/5 rounded-sm text-white text-sm font-medium outline-none focus:border-amber-500/30 placeholder-white/20 transition-colors"
                        />
                        <button className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all whitespace-nowrap shadow-2xl shadow-amber-500/10">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-[1400px] mx-auto px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                {/* Brand */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-amber-500/60 rounded-sm flex items-center justify-center">
                                <span className="text-amber-400 font-black text-xl tracking-tighter italic">LE</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-sm" />
                        </div>
                        <div>
                            <span className="text-white text-lg font-black tracking-[0.2em] uppercase block leading-tight">Luxury</span>
                            <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.4em] uppercase">Estate</span>
                        </div>
                    </div>
                    <p className="text-white/25 text-sm leading-relaxed max-w-sm">
                        Purveyors of the world&apos;s most exceptional properties. A bespoke real estate experience for the discerning buyer since 2008.
                    </p>
                    <div className="flex gap-4 mt-8">
                        {['LinkedIn', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                            <a key={social} href="#" className="w-10 h-10 border border-white/5 hover:border-amber-500/30 rounded-sm flex items-center justify-center text-white/20 hover:text-amber-400 transition-all">
                                <span className="text-[10px] font-black">{social[0]}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/50 mb-6">Services</h4>
                    <div className="space-y-3">
                        {['Luxury Sales', 'Private Collection', 'Investment Advisory', 'Relocation', 'Concierge'].map((item) => (
                            <a key={item} href="#" className="block text-sm text-white/25 hover:text-amber-400 transition-colors duration-300">{item}</a>
                        ))}
                    </div>
                </div>

                {/* Offices */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/50 mb-6">Offices</h4>
                    <div className="space-y-4">
                        {[
                            { city: 'Toronto', addr: '100 Bloor St W, Suite 800' },
                            { city: 'Vancouver', addr: '999 W Hastings, Suite 1200' },
                            { city: 'Montreal', addr: '1000 Rue Sherbrooke O' },
                        ].map((office) => (
                            <div key={office.city}>
                                <p className="text-white/50 text-sm font-bold">{office.city}</p>
                                <p className="text-white/20 text-xs mt-0.5">{office.addr}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/50 mb-6">Private Line</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Phone</p>
                            <p className="text-white/50 text-sm">+1 (416) 555-ELITE</p>
                        </div>
                        <div>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Email</p>
                            <p className="text-white/50 text-sm">concierge@luxuryestate.ca</p>
                        </div>
                        <div>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Hours</p>
                            <p className="text-white/50 text-sm">By Appointment Only</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/15 text-xs">© 2026 LuxuryEstate. All rights reserved. An invitation-only experience.</p>
                <div className="flex gap-8">
                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                        <a key={link} href="#" className="text-white/15 hover:text-amber-400/40 text-xs transition-colors">{link}</a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);
