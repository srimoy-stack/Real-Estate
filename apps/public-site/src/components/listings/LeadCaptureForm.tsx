'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { listingService } from '@repo/services';

interface LeadCaptureFormProps {
    listingId: string;
    listingTitle: string;
    tenantId?: string;
}

export const LeadCaptureForm = ({ listingId, listingTitle, tenantId }: LeadCaptureFormProps) => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: `I would like more information regarding the property at ${listingTitle}`,
        source: 'direct',
    });

    // Auto-detect source on mount
    useEffect(() => {
        const utmSource = searchParams.get('utm_source');
        const referrer = typeof document !== 'undefined' ? document.referrer : '';

        let detectedSource = utmSource || 'website';
        if (referrer && !referrer.includes(window.location.hostname)) {
            detectedSource = `referral: ${new URL(referrer).hostname}`;
        }

        setFormData(prev => ({ ...prev, source: detectedSource }));
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

        setLoading(true);
        try {
            await listingService.submitLead(listingId, {
                ...formData,
                tenantId,
                message: `${formData.message}\n\n[Auto-Attached Reference ID: ${listingId}]`
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

            if (process.env.NODE_ENV === 'development') {
                setTimeout(() => {
                    setSuccess(true);
                    setLastSubmitTime(Date.now());
                }, 800);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-xl bg-emerald-50 p-8 text-center border border-emerald-200">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Message Sent!</h3>
                <p className="mt-2 text-sm text-emerald-700 leading-relaxed">
                    Your inquiry for <strong>{listingTitle}</strong> has been received.
                    An agent will be in touch with you shortly.
                </p>
                <div className="mt-6 pt-5 border-t border-emerald-200">
                    <p className="text-xs text-emerald-600 font-semibold mb-3">Reference ID: {listingId}</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors underline"
                    >
                        Send another message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
            {/* Header */}
            <h3 className="text-xl font-bold text-gray-900 mb-1">Ask About this Home</h3>
            <p className="text-xs text-gray-500 mb-6">
                Learn more by viewing our{' '}
                <a href="/privacy" className="text-emerald-600 hover:underline">privacy policy</a>
                {' '}or{' '}
                <a href="/contact" className="text-emerald-600 hover:underline">contact us</a>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs font-medium text-center">
                        {error}
                    </div>
                )}

                {/* Full Name */}
                <div className="relative">
                    <input
                        required
                        type="text"
                        placeholder="Full Name"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                {/* Email */}
                <div className="relative">
                    <input
                        required
                        type="email"
                        placeholder="Email Address"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Phone */}
                <div className="relative">
                    <input
                        required
                        type="tel"
                        placeholder="Phone Number (Mobile)"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Message */}
                <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                />

                {/* Submit Button — Zolo Green */}
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Send Message'
                    )}
                </button>
            </form>
        </div>
    );
};
