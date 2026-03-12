'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { leadService } from '@repo/services';

interface LeadCaptureFormProps {
    listingId: string;
    mlsNumber: string;
    listingTitle: string;
    websiteId?: string;
}

export const LeadCaptureForm = ({
    listingId,
    mlsNumber,
    listingTitle,
    websiteId,
}: LeadCaptureFormProps) => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: `I would like more information regarding ${listingTitle}.`,
    });

    // Auto-detect source on mount
    const [detectedSource, setDetectedSource] = useState('listing_page');
    useEffect(() => {
        const utmSource = searchParams.get('utm_source');
        if (utmSource) {
            setDetectedSource(`listing_page_${utmSource}`);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Prevent duplicate rapid submissions (60 second cooldown)
        const now = Date.now();
        if (lastSubmitTime && now - lastSubmitTime < 60000) {
            setError('Please wait a moment before sending another inquiry.');
            return;
        }

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await leadService.createLead({
                websiteId: websiteId || 'ws-1', // Fallback to demo website
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
                mlsNumber,
                source: detectedSource,
                status: 'New'
            });

            setSuccess(true);
            setLastSubmitTime(Date.now());

            setFormData(prev => ({
                ...prev,
                name: '',
                email: '',
                phone: '',
            }));
        } catch (err: any) {
            console.error('Failed to submit lead', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-4 py-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Inquiry Sent!</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Your inquiry for <strong>MLS® {mlsNumber}</strong> has been received.
                    An agent will contact you shortly.
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Reference: {listingId}
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium text-center">
                    {error}
                </div>
            )}

            {/* Full Name */}
            <div className="relative">
                <input
                    required
                    type="text"
                    id="lead-name"
                    placeholder="Full Name *"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            {/* Email */}
            <div className="relative">
                <input
                    required
                    type="email"
                    id="lead-email"
                    placeholder="Email Address *"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            {/* Phone */}
            <div className="relative">
                <input
                    required
                    type="tel"
                    id="lead-phone"
                    placeholder="Phone Number *"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            {/* Message */}
            <textarea
                rows={3}
                id="lead-message"
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none bg-slate-50/50"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
            />

            {/* Hidden context fields (visible in dev tools for debugging) */}
            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="mlsNumber" value={mlsNumber} />
            <input type="hidden" name="source" value={detectedSource} />

            {/* Submit Button */}
            <button
                disabled={loading}
                type="submit"
                id="lead-submit-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
                {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Request Information'
                )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                By submitting, you agree to our{' '}
                <a href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" className="text-indigo-500 hover:underline">Terms of Service</a>.
            </p>
        </form>
    );
};
