import React from 'react';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata = {
    title: 'Contact Us | Real Estate Support',
    description: 'Get in touch with our expert real estate team for inquiries about listings, market trends, or selling your home.',
};

export default function ContactPage() {
    return (
        <div className="bg-slate-900 pt-20">
            {/* We reuse the ContactSection but wrap it to make it a full page */}
            <ContactSection />

            {/* Additional FAQ or Map could go here */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="p-8 space-y-4">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">Support</h3>
                            <p className="text-slate-500 font-medium text-sm">Our technical team is available for platform assistance.</p>
                            <a href="mailto:hello@squareft.ca" className="text-[#4F46E5] font-black text-xs uppercase tracking-widest block">Email Support</a>
                        </div>
                        <div className="p-8 space-y-4 border-x border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">Office</h3>
                            <p className="text-slate-500 font-medium text-sm">Visit our main headquarters in Brampton.</p>
                            <span className="text-[#4F46E5] font-black text-xs uppercase tracking-widest block">416-903-7171</span>
                        </div>
                        <div className="p-8 space-y-4">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">Press</h3>
                            <p className="text-slate-500 font-medium text-sm">For media inquiries and market reports.</p>
                            <a href="mailto:hello@squareft.ca" className="text-[#4F46E5] font-black text-xs uppercase tracking-widest block">Media Kit</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
