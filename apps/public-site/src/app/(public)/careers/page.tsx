import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers | Join Our High-Performance Real Estate Team',
    description: 'Are you a tech-savvy agent or a passionate developer? Discover career opportunities in the future of real estate.',
};

export default function CareersPage() {
    const jobs = [
        {
            title: 'Licensed Real Estate Agent',
            location: 'Toronto / Vancouver',
            type: 'Commission'
        },
        {
            title: 'Senior Frontend Engineer',
            location: 'Remote (Canada)',
            type: 'Full-time'
        },
        {
            title: 'Product Designer',
            location: 'Toronto, ON',
            type: 'Full-time'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative py-24 bg-gray-50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Build the <span className="text-emerald-600">Future</span> of Real Estate.
                        </h1>
                        <p className="mt-6 text-xl text-gray-500 leading-relaxed">
                            We&apos;re looking for thinkers, doers, and rebels who want to change how the world finds home. Join a team where your work impacts millions of lives.
                        </p>
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Current Openings</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest leading-none">
                            {jobs.length} Positions
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job, idx) => (
                            <div key={idx} className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                                    <div className="flex gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        <span>📍 {job.location}</span>
                                        <span>⌛ {job.type}</span>
                                    </div>
                                </div>
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                    →
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-emerald-600 p-12 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                        <h3 className="text-2xl font-bold mb-4 italic">Don&apos;t see a role for you?</h3>
                        <p className="text-emerald-100 mb-8 max-w-lg mx-auto leading-relaxed">
                            We&apos;re always looking for exceptional talent in engineering, data science, and brokerage operations.
                        </p>
                        <a href="mailto:careers@realestate.com" className="inline-block px-10 py-4 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-all uppercase tracking-widest text-xs">
                            Drop us a line
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
