import { blogService } from '@repo/services';
import { BlogPost } from '@repo/mock-api';
import { BlogCard } from '@/components/blog/BlogCard';

export const metadata = {
    title: 'Real Estate Insights & News | Our Blog',
    description: 'Expert advice, market trends, and luxury living guides from our professional real estate team.',
};

export default async function BlogPage() {
    const posts = await blogService.getPosts();

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <section className="pt-32 pb-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/30 -skew-x-12 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">The Modern Journal</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85] max-w-2xl">
                            Insights <br className="hidden md:block" /> & <span className="text-indigo-600 italic">Vision.</span>
                        </h1>
                        <p className="max-w-md text-slate-500 text-lg font-medium leading-relaxed pb-2">
                            A curated selection of articles covering everything from market forecasts to interior design inspiration for the modern homeowner.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="py-8 sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-4">Categories:</span>
                        {['All Posts', 'Market Trends', 'Buying Guide', 'Architecture', 'Selling Guide'].map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-slate-950 text-white shadow-lg shadow-black/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16">
                        {posts.map((post: BlogPost) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 border border-slate-100 text-center space-y-8">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Stay updated with <span className="text-indigo-600 italic">weekly</span> insights.</h2>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto">Join 10,000+ readers who receive our exclusive market reports and property curation directly in their inbox.</p>
                        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-16 px-8 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                            />
                            <button className="h-16 px-10 bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-black/10 shrink-0">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
