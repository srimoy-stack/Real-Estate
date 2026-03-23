import React from 'react';

export interface AgentDetailSectionProps {
    agent?: any;
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
}

export const AgentDetailSection: React.FC<AgentDetailSectionProps> = ({ agent, variant = 'default' }) => {
    if (!agent) return <div className="p-20 text-center text-slate-400">Loading profile...</div>;

    const isLuxury = variant === 'luxury';
    // const isMinimal = variant === 'minimal';
    // const isCorporate = variant === 'corporate';

    return (
        <section className={`py-24 ${isLuxury ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Portrait */}
                    <div className="relative group">
                        <div className={`aspect-[4/5] rounded-[3rem] overflow-hidden ${isLuxury ? 'shadow-2xl shadow-indigo-500/10 border-2 border-white/5' : 'shadow-xl'}`}>
                            <img src={agent.profilePhoto || agent.image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"} alt={agent.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        {/* Status Float */}
                        <div className={`absolute -bottom-6 -right-6 p-10 rounded-[2.5rem] ${isLuxury ? 'bg-indigo-600 shadow-2xl' : 'bg-slate-900 shadow-xl'}`}>
                            <p className="text-white font-black text-xl leading-none">Top <br /><span className="text-indigo-400">Producer</span></p>
                        </div>
                    </div>

                    {/* Bio & Links */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Real Estate Professional</p>
                            <h1 className={`text-4xl md:text-6xl font-black ${isLuxury ? 'text-white' : 'text-slate-900'} tracking-tighter mb-4 italic`}>{agent.name}</h1>
                            <p className={`text-xl font-medium ${isLuxury ? 'text-slate-400' : 'text-slate-500'}`}>{agent.title} • Luxury Property Specialist</p>
                        </div>

                        <div className={`p-8 rounded-[2rem] border ${isLuxury ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-lg leading-relaxed ${isLuxury ? 'text-slate-300' : 'text-slate-600'}`}>
                                {agent.bio || "With over a decade of luxury real estate experience, I bring a unique blend of market intelligence and strategic negotiation toทุก transaction. My commitment to excellence has earned me a reputation as one of the most trusted advisors."}
                            </p>
                        </div>

                        {/* Social & Contact Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button className="px-10 py-5 bg-indigo-600 text-white font-black rounded-full hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-[11px]">
                                Contact {agent.name.split(' ')[0]}
                            </button>
                            <div className="flex gap-2">
                                {['fb', 'ig', 'in'].map(s => (
                                    <button key={s} className={`h-14 w-14 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-all font-black uppercase text-[10px] ${isLuxury ? 'border-white/10 text-white hover:bg-white/5' : 'text-slate-900'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats mini */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100/10">
                            {[
                                { val: '150+', label: 'Sold' },
                                { val: '$200M+', label: 'Volume' },
                                { val: '12', label: 'Years' }
                            ].map(s => (
                                <div key={s.label}>
                                    <p className={`text-2xl font-black ${isLuxury ? 'text-white' : 'text-slate-900'}`}>{s.val}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
