'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { leadService } from '@repo/services';

interface LeadCaptureFormProps {
    listingId: string;
    mlsNumber: string;
    listingTitle: string;
    agentId?: string;
    websiteId?: string;
}

export const LeadCaptureForm = ({
    listingId,
    mlsNumber,
    listingTitle,
    agentId,
    websiteId,
}: LeadCaptureFormProps) => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const displayTitle = (listingTitle && listingTitle !== 'undefined' && !listingTitle.toLowerCase().includes('null')) 
      ? listingTitle 
      : 'this property';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: `I would like more information about ${displayTitle}.`,
    });

    // Auto-detect source on mount (supports UTM tagging)
    const [detectedSource, setDetectedSource] = useState('listing_page');
    useEffect(() => {
        const utmSource = searchParams.get('utm_source');
        if (utmSource) {
            setDetectedSource(`listing_page_${utmSource}`);
        }
    }, [searchParams]);

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

        // Prevent duplicate rapid submissions (5 second cooldown for demo)
        const now = Date.now();
        if (lastSubmitTime && now - lastSubmitTime < 5000) {
            setError('Please wait a moment before sending another inquiry.');
            return;
        }

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await leadService.createLead({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
                source: detectedSource,
                listingId,
                agentId,
                mlsNumber,
                websiteId: websiteId || 'ws-1',
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
            <div className="text-center space-y-4 py-4 animate-[fadeIn_0.5s_ease-out]">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Thank you! Your inquiry has been sent.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Your inquiry for <strong>MLS® {mlsNumber}</strong> has been received.
                    An agent will contact you shortly.
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Reference: {listingId}
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium text-center animate-[fadeIn_0.3s_ease-out]">
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
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5]/70 focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all bg-slate-50/50"
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
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5]/70 focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all bg-slate-50/50"
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
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5]/70 focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all bg-slate-50/50"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            {/* Message */}
            <textarea
                rows={3}
                id="lead-message"
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5]/70 focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all resize-none bg-slate-50/50"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
            />

            {/* Hidden context fields */}
            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="mlsNumber" value={mlsNumber} />
            <input type="hidden" name="source" value={detectedSource} />

            {/* Submit Button */}
            <button
                disabled={loading}
                type="submit"
                id="lead-submit-btn"
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#4F46E5]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
                {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Request Information'
                )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                By submitting, you agree to our{' '}
                <a href="/privacy" className="text-[#4F46E5]/80 hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" className="text-[#4F46E5]/80 hover:underline">Terms of Service</a>.
            </p>
        </form>
    );
};
