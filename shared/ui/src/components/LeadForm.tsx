'use client';

import React, { useState } from 'react';
import { leadService } from '@repo/services';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';

interface LeadFormProps {
    websiteId: string;
    mlsNumber?: string;
    source: string;
    className?: string;
    title?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({
    websiteId,
    mlsNumber,
    source,
    className = '',
    title = 'Inquire About This Property'
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: mlsNumber ? `I am interested in ${mlsNumber}. Please provide more information.` : 'I would like more information about your services.'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await leadService.createLead({
                websiteId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                mlsNumber,
                source,
                status: 'New'
            });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={`p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 text-center space-y-4 ${className}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Inquiry Received!</h3>
                <p className="text-slate-600 font-medium">An expert agent will contact you shortly.</p>
                <Button onClick={() => setIsSuccess(false)} className="mt-4">Send Another Message</Button>
            </div>
        );
    }

    return (
        <div className={`bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 ${className}`}>
            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter mb-6">
                {title}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                    <Input
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-2xl border-slate-100 focus:ring-amber-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                        <Input
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="rounded-2xl border-slate-100 focus:ring-amber-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                        <Input
                            type="tel"
                            placeholder="(555) 000-0000"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="rounded-2xl border-slate-100 focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Message</label>
                    <Textarea
                        placeholder="Tell us what you're looking for..."
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="rounded-2xl border-slate-100 focus:ring-amber-500"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs font-bold italic">{error}</p>
                )}

                <Button
                    type="submit"
                    className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-4"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending Request...' : 'Send Inquiry'}
                    {!isSubmitting && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                </Button>
            </form>

            <p className="text-[10px] text-slate-400 text-center mt-6 font-medium">
                By clicking "Send Inquiry", you agree to our <span className="underline cursor-pointer">Terms of Use</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
        </div>
    );
};
