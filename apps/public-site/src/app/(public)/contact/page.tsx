import { Metadata } from 'next';
import { LeadForm } from '@repo/ui';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';

export const metadata: Metadata = {
    title: 'Contact Us | Get in Touch with Our Real Estate Experts',
    description: 'Have a question about a property? Need help selling your home? Our experts are here for you 24/7.',
};

export default function ContactPage() {
    const website = getWebsiteFromHeaders();

    return (
        <div className="min-h-screen bg-white">
            {/* Top Accent Strip */}
            <div className="w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />

            <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

                    {/* Left Column: Form */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                                Get in <span className="text-emerald-600">Touch.</span>
                            </h1>
                            <p className="mt-4 text-lg text-gray-500 font-medium">
                                Our support team and agents are available 24/7 to answer your questions.
                            </p>
                        </div>

                        <LeadForm
                            websiteId={website?.id || 'ws-1'}
                            source="Contact Page"
                            title="Send us a Message"
                        />
                    </div>

                    {/* Right Column: Info */}
                    <div className="lg:pt-20">
                        <div className="bg-gray-50 rounded-[3rem] p-12 space-y-12">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 italic">Direct Support</h3>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-4 group">
                                            <span className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">📱</span>
                                            <span className="text-lg font-bold text-gray-900">+1 (800) 555-0123</span>
                                        </p>
                                        <p className="flex items-center gap-4 group">
                                            <span className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">✉️</span>
                                            <span className="text-lg font-bold text-gray-900">support@realestate.com</span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 italic">Main Office</h3>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-gray-900 italic leading-tight">123 King Street West,</p>
                                        <p className="text-lg font-bold text-gray-900 italic leading-tight">Toronto, ON M5V 1L1</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 italic">Follow Our Journey</h3>
                                    <div className="flex gap-4">
                                        {['IG', 'X', 'IN', 'FB'].map(social => (
                                            <div key={social} className="h-10 w-10 cursor-pointer rounded-xl bg-white flex items-center justify-center text-[10px] font-black tracking-widest text-gray-400 hover:text-emerald-600 hover:border-emerald-100 border border-gray-100 transition-all shadow-sm">
                                                {social}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="aspect-[1.5/1] bg-gray-200 rounded-[2rem] overflow-hidden grayscale group relative">
                                <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none group-hover:opacity-0 transition-opacity" />
                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-79.3832,43.6532,14,0/800x600?access_token=none')] bg-cover bg-center" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-12 w-12 rounded-full bg-emerald-600 border-4 border-white shadow-2xl animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
