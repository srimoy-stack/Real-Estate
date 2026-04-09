'use client';

import React from 'react';
import { useAuth } from '@repo/auth';

export default function ProfilePage() {
    const { user } = useAuth() as any;

    if (!user) return null;

    const profileDetails = [
        { label: 'Full Legal Name', value: user.name || 'Not Provided', icon: '👤' },
        { label: 'Primary Email', value: user.email, icon: '✉️' },
        { label: 'Mobile Device', value: user.phone || 'Not Connected', icon: '📱' },
        { label: 'Account Tier', value: user.role || 'Member', icon: '💎' },
        { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recent', icon: '🗓️' },
        { label: 'Identity Protocol', value: 'OAuth 2.0 / JWT Secure', icon: '🔒' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Identity Header */}
            <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50 rounded-[48px] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000" />
                
                <div className="relative z-10 w-32 h-32 rounded-[40px] bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-white">
                    {user.name?.charAt(0) || 'U'}
                </div>
                
                <div className="relative z-10 text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                    <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center md:justify-start gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                        Verified Identity Profile
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                        <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">ID: {user.id.slice(0, 8)}...</span>
                        <span className="px-4 py-1.5 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200">{user.role || 'Viewer'}</span>
                    </div>
                </div>

                <div className="md:ml-auto">
                    <button className="h-12 px-8 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        Request Metadata Export
                    </button>
                </div>
            </div>

            {/* Comprehensive Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileDetails.map((detail, i) => (
                    <div 
                        key={detail.label} 
                        className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group"
                        style={{ animationDelay: `${i * 50}ms`, animation: 'profileFadeIn 0.5s ease-out forwards', opacity: 0 }}
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-500">
                                {detail.icon}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail.label}</p>
                                <p className="text-base font-black text-slate-900 tracking-tight">{detail.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Privacy Notification */}
            <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-start gap-6">
                <div className="text-2xl mt-1">🛡️</div>
                <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-900">Privacy & Security First</h4>
                    <p className="text-sm text-indigo-800/70 font-medium leading-relaxed">
                        Your data is encrypted using military-grade AES-256 protocols. SquareFT never shares your personal identity with third-party agents without explicit, item-by-item authorization.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes profileFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
