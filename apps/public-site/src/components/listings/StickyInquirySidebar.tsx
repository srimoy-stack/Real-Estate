'use client';

import { useState } from 'react';
import Image from 'next/image';
import { leadService } from '@repo/services';
import { LeadCaptureForm } from './LeadCaptureForm';
import { Listing } from '@repo/types';

interface StickyInquirySidebarProps {
    listing: Listing;
}

export const StickyInquirySidebar = ({ listing }: StickyInquirySidebarProps) => {
    const [activeTab, setActiveTab] = useState<'request' | 'schedule'>('request');

    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <>
            <div className="hidden lg:block sticky top-24 w-full max-w-sm ml-auto space-y-4">
                {/* Tab Headers */}
                <div className="flex bg-white/50 backdrop-blur-md rounded-t-[32px] overflow-hidden border-t border-x border-slate-100">
                    <button
                        onClick={() => setActiveTab('request')}
                        className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'request' ? 'text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Request Info
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Schedule a tour
                    </button>
                </div>

                {/* Main Container */}
                <div className="bg-white rounded-b-[40px] rounded-tr-[40px] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
                    {/* Agent Short Info */}
                    <div className="flex items-center gap-5">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-xl group">
                            <Image
                                src={listing.agentPhoto || `https://i.pravatar.cc/200?u=${listing.id}`}
                                alt={listing.agentName}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{listing.agentName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{(listing as any).agentTitle || 'Sales Coordinator'}</p>
                            {listing.brokerageName && (
                                <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600/60 mt-1">{listing.brokerageName}</p>
                            )}
                        </div>
                    </div>

                    {activeTab === 'request' ? (
                        <div className="space-y-6">
                            <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20">
                                Schedule a showing?
                            </div>
                            <LeadCaptureForm
                                listingId={listing.id}
                                mlsNumber={listing.mlsNumber}
                                listingTitle={listing.title}
                            />
                        </div>
                    ) : (
                        <ScheduleTourForm listing={listing} />
                    )}

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-50">
                        <button className="flex items-center justify-center gap-3 w-full py-4 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            Call Agent
                        </button>
                        <button className="flex items-center justify-center gap-3 w-full py-4 text-emerald-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338-11.892-11.893-11.892-1.996-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.547.919 3.482 1.44 5.416 1.441 5.452 0 9.889-4.437 9.889-9.891 0-2.64-1.029-5.122-2.898-6.991-1.868-1.868-4.349-2.897-6.991-2.897-5.451 0-9.889 4.437-9.889 9.891 0 2.02.614 3.997 1.774 5.69l-.939 3.428 3.51-.921zm10.987-1.511c-.3.12-1.77.87-2.046.972-.276.103-.476.155-.676-.153-.2.302-.776.974-.951 1.178-.175.204-.351.229-.65.071-.3-.152-1.27-.467-2.42-1.485-.896-.792-1.498-1.77-1.674-2.072-.176-.3-.018-.462.132-.612.135-.133.301-.354.451-.531.149-.177.199-.303.301-.505.101-.202.05-.38-.026-.531-.076-.151-.676-1.627-.926-2.231-.244-.59-.49-.51-.676-.52-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.802.378-.276.301-1.052 1.027-1.052 2.506 0 1.479 1.076 2.909 1.226 3.111.15.202 2.12 3.232 5.14 4.536.72.309 1.28.495 1.71.631.72.23 1.38.19 1.89.11.58-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.08-.13-.27-.202-.57-.322z" /></svg>
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* Float Ads Badge */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Premium Partner</p>
                        <p className="text-xs font-bold text-slate-900">32,000+ Active Buyers</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:rotate-12 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <a href={`tel:${listing.agentPhone}`} className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </a>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex-1 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20"
                >
                    Inquire Now
                </button>
            </div>

            {/* Mobile Modal Overlay */}
            {isFormOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out] p-4 flex items-end">
                    <div className="w-full bg-white rounded-[40px] p-8 space-y-6 animate-[slideInUp_0.4s_ease-out]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Inquiry</h3>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <LeadCaptureForm listingId={listing.id} mlsNumber={listing.mlsNumber} listingTitle={listing.title} />
                    </div>
                </div>
            )}
        </>
    );
};

/** Schedule Tour tab – wired to leadService */
const ScheduleTourForm = ({ listing }: { listing: Listing }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', time: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) { setError('Name is required.'); return; }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Valid email is required.'); return; }
        if (!formData.phone.trim()) { setError('Phone is required.'); return; }

        setIsSubmitting(true);
        try {
            await leadService.createLead({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: `Tour request for ${listing.title} — Preferred time: ${formData.time || 'Flexible'}`,
                source: 'listing_page',
                listingId: listing.id,
                mlsNumber: listing.mlsNumber,
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', time: '' });
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-4 animate-[fadeIn_0.5s_ease-out]">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-base font-black text-slate-900">Thank you! Your inquiry has been sent.</h3>
                <p className="text-sm text-slate-500">An agent will confirm your tour time shortly.</p>
                <button onClick={() => setIsSuccess(false)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline">Book another</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-indigo-600/20">
                Book an Appointment
            </div>
            {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium text-center">{error}</div>}
            <input required type="text" placeholder="Your Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" />
            <input required type="email" placeholder="Email Address *" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" />
            <input required type="tel" placeholder="Phone Number *" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" />
            <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                <option value="">Please select a time</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>01:00 PM</option>
                <option>03:00 PM</option>
            </select>
            <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Request Booking'}
            </button>
        </form>
    );
};
