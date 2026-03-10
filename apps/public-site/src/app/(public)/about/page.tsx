import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Premier Real Estate Services',
    description: 'Learn about our journey, our values, and the team dedicated to finding your perfect home.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-gray-50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Redefining the <span className="text-emerald-600">Home Search</span> experience.
                        </h1>
                        <p className="mt-6 text-xl text-gray-500 leading-relaxed">
                            We started with a simple mission: to make finding a home as easy as booking a hotel. Today, we're one of the fastest-growing real estate platforms in Canada.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-emerald-600/10 z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
                                alt="Modern architectural office"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                                Our Story
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">From a small startup to a national leader.</h2>
                            <div className="space-y-6 text-lg text-gray-600">
                                <p>
                                    Founded in 2012, we recognized that the traditional real estate model was broken. It was slow, lacked transparency, and relied on outdated technology.
                                </p>
                                <p>
                                    We built a platform that puts the power back in the hands of the consumer. Real-time data, instant bookings, and professional advice are now just a click away.
                                </p>
                                <p>
                                    Today, we help millions of Canadians discover their dream homes every month, backed by a team of over 500 agents and tech experts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
                        <p className="mt-4 text-gray-500">The principles that guide everything we do.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Data-Driven',
                                desc: 'We use real-time market insights to give you an edge in every transaction.',
                                icon: '📊'
                            },
                            {
                                title: 'Customer Obsessed',
                                desc: 'Your satisfaction is our only metric of success. We are here 24/7 for you.',
                                icon: '🤝'
                            },
                            {
                                title: 'Unapologetic Integrity',
                                desc: 'Honesty is our policy. No hidden fees, no fine print, just transparent real estate.',
                                icon: '🛡️'
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="text-4xl mb-6">{value.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-emerald-600 rounded-[3rem] py-16 px-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
                        {[
                            { val: '10M+', label: 'Monthly Users' },
                            { val: '500+', label: 'Local Agents' },
                            { val: 'CAD $20B', label: 'Properties Sold' },
                            { val: '98%', label: 'Happy Clients' }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-white">
                                <div className="text-3xl font-extrabold mb-1">{stat.val}</div>
                                <div className="text-emerald-100 text-sm font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-24 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 italic">Ready to find your <span className="text-emerald-600">next chapter?</span></h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="/listings" className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                            Browse Listings
                        </a>
                        <a href="/contact" className="w-full sm:w-auto px-10 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all">
                            Contact an Agent
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
