'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => (
    <footer className="bg-[#0a1628] relative overflow-hidden">
        {/* Top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

        {/* Newsletter */}
        <div className="border-b border-white/5">
            <div className="max-w-[1400px] mx-auto px-8 py-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-xl font-black text-white">Stay Updated on New Listings</h3>
                        <p className="text-white/30 text-sm mt-1">Get exclusive listings and market insights delivered to your inbox.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 md:w-72 px-5 py-3 bg-white/5 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-amber-400/30 placeholder-white/20 transition-colors"
                        />
                        <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-sm rounded-xl transition-all whitespace-nowrap shadow-lg shadow-amber-500/10">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Main footer */}
        <div className="max-w-[1400px] mx-auto px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div>
                    <Link href="/" className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <span className="text-white font-black text-lg">S</span>
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg block leading-tight">Sarah Mitchell</span>
                            <span className="text-amber-400/50 text-[9px] font-bold uppercase tracking-[0.3em]">Real Estate</span>
                        </div>
                    </Link>
                    <p className="text-white/25 text-sm leading-relaxed">Toronto&apos;s trusted real estate advisor with 12+ years helping families find their perfect home.</p>
                    <div className="flex gap-3 mt-6">
                        {['In', 'Ig', 'Tw', 'Fb'].map((social) => (
                            <a key={social} href="#" className="w-9 h-9 bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/20 rounded-lg flex items-center justify-center text-white/30 hover:text-amber-400 transition-all text-xs font-bold">
                                {social}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-[10px] font-bold text-amber-400/50 uppercase tracking-[0.3em] mb-6">Quick Links</h4>
                    <div className="space-y-3">
                        {['My Listings', 'About Me', 'Communities', 'Blog', 'Contact'].map((item) => (
                            <a key={item} href="#" className="block text-sm text-white/25 hover:text-amber-400 transition-colors">{item}</a>
                        ))}
                    </div>
                </div>

                {/* Communities */}
                <div>
                    <h4 className="text-[10px] font-bold text-amber-400/50 uppercase tracking-[0.3em] mb-6">Areas of Expertise</h4>
                    <div className="space-y-3">
                        {['Forest Hill', 'Yorkville', 'Rosedale', 'The Annex', 'Lawrence Park'].map((item) => (
                            <a key={item} href="#" className="block text-sm text-white/25 hover:text-amber-400 transition-colors">{item}</a>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-[10px] font-bold text-amber-400/50 uppercase tracking-[0.3em] mb-6">Get In Touch</h4>
                    <div className="space-y-3">
                        <p className="text-sm text-white/30">(416) 555-0101</p>
                        <p className="text-sm text-white/30">sarah@sarahmitchell.ca</p>
                        <p className="text-sm text-white/30">100 Yorkville Ave, Suite 200</p>
                        <p className="text-sm text-white/30">Toronto, ON M5R 1B9</p>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/15 text-xs">© 2026 Sarah Mitchell Real Estate. All rights reserved.</p>
                <div className="flex gap-6">
                    {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((link) => (
                        <a key={link} href="#" className="text-white/15 hover:text-amber-400/40 text-xs transition-colors">{link}</a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);
