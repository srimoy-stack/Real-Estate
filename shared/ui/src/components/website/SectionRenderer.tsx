'use client';

import React from 'react';
import type {
    SectionConfig,
    HeroContent,
    FeaturedListingsContent,
    StatsContent,
    ContactCtaContent,
    HowItWorksContent,
    TestimonialsContent,
    NewsletterContent,
    AboutBannerContent,
    GalleryContent,
    BlogPreviewContent,
    CommunitiesContent,
    ListingsSectionContent,
    AgentsContent,
} from '@repo/types';
import { ListingCard } from '../ListingCard';
import { listingService, listingSectionService, listingQueryApi, agentService } from '@repo/services';

// ═══════════════════════════════════════════════════════════
//  SECTION COMPONENTS — Zolo-inspired clean design
//  Palette: White backgrounds, gray text, green accents
// ═══════════════════════════════════════════════════════════

const HeroSection: React.FC<{ content: HeroContent }> = ({ content }) => (
    <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
            {content.bgImage ? (
                <img src={content.bgImage} alt="Hero" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800" />
            )}
            <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-5 leading-tight">
                {content.headline || 'Your New Home Awaits'}
            </h1>
            <p className="text-lg text-gray-200 font-normal mb-8 max-w-xl mx-auto leading-relaxed">
                {content.subheadline || 'Discover the most exclusive properties in the region.'}
            </p>

            {/* Search Bar Overlay — Zolo-style */}
            <div className="bg-white rounded-lg shadow-xl p-2 max-w-2xl mx-auto flex gap-2">
                <input
                    type="text"
                    placeholder="Search by city, address, neighborhood or MLS® #"
                    className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
                />
                <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors text-sm">
                    {content.buttonText || 'Search'}
                </button>
            </div>
        </div>
    </section>
);

const FeaturedListingsSection: React.FC<{ content: FeaturedListingsContent }> = ({ content }) => {
    const [listings, setListings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // If specific IDs are provided, fetch them. Otherwise fetch featured listings.
                const params = content.listingIds && content.listingIds.length > 0
                    ? { ids: content.listingIds }
                    : { featured: true, limit: content.maxItems || 3 };

                const response = await listingQueryApi.searchListings(params);
                setListings(response.listings);
            } catch (error) {
                console.error('Failed to fetch featured listings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, [content.listingIds, content.maxItems]);

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-10 bg-amber-500 rounded-full" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 italic">Curated Collection</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">
                            {content.title || 'Featured <span className="text-amber-600">Residences</span>'}
                        </h2>
                        {content.subtitle && (
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                {content.subtitle}
                            </p>
                        )}
                    </div>
                    <a
                        href="/listings"
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
                    >
                        Explore All Properties
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-slate-50 rounded-[40px] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={{
                                    ...listing,
                                    mainImage: listing.images?.[0] || '',
                                } as any}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black italic">No featured selections available at this time.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const StatsSection: React.FC<{ content: StatsContent }> = ({ content }) => (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-10 text-center">
                {content.title || 'Market Impact'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {content.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                        <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                            {stat.value}
                        </p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const HowItWorksSection: React.FC<{ content: HowItWorksContent }> = ({ content }) => (
    <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">{content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {content.steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl mb-4">
                            {step.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.heading}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const TestimonialsSection: React.FC<{ content: TestimonialsContent }> = ({ content }) => (
    <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">{content.title}</h2>
            {content.testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {content.testimonials.map(testimonial => (
                        <div key={testimonial.id} className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                {testimonial.avatarUrl && (
                                    <img
                                        src={testimonial.avatarUrl}
                                        alt={testimonial.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                                    {testimonial.role && (
                                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">&ldquo;{testimonial.quote}&rdquo;</p>
                            {testimonial.rating && (
                                <div className="mt-3 text-amber-400 text-sm">
                                    {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400">No testimonials added yet.</p>
            )}
        </div>
    </section>
);

const ContactCtaSection: React.FC<{ content: ContactCtaContent }> = ({ content }) => (
    <section className="py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">{content.title || 'Ready to start your journey?'}</h2>
            {content.description && (
                <p className="text-gray-400 mb-8 text-lg">{content.description}</p>
            )}
            <a
                href={content.buttonHref}
                className="inline-block px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-lg text-sm"
            >
                {content.buttonLabel || 'Contact Us Today'}
            </a>
        </div>
    </section>
);

const NewsletterSection: React.FC<{ content: NewsletterContent }> = ({ content }) => (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{content.title}</h2>
            {content.subtitle && (
                <p className="text-gray-500 mb-6">{content.subtitle}</p>
            )}
            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
                <input
                    type="email"
                    placeholder={content.placeholder}
                    className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                    {content.buttonLabel}
                </button>
            </form>
        </div>
    </section>
);

const AboutBannerSection: React.FC<{ content: AboutBannerContent }> = ({ content }) => (
    <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{content.description}</p>
                {content.buttonText && (
                    <a
                        href={content.buttonHref ?? '#'}
                        className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    >
                        {content.buttonText}
                    </a>
                )}
            </div>
            {content.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    </section>
);

const GallerySection: React.FC<{ content: GalleryContent }> = ({ content }) => (
    <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{content.title}</h2>
            <div className={`grid gap-2 ${content.layout === 'masonry' ? 'columns-2 md:columns-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                {content.images.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-lg group">
                        <img
                            src={img.url}
                            alt={img.caption ?? `Gallery image ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const BlogPreviewSection: React.FC<{ content: BlogPreviewContent }> = ({ content }) => (
    <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">{content.title}</h2>
            {content.subtitle && (
                <p className="text-gray-500 text-center mb-10">{content.subtitle}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: content.maxPosts }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 group hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-200" />
                        <div className="p-5">
                            <p className="text-xs font-semibold text-emerald-600 mb-1.5">Article</p>
                            <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">Blog Post Title {i + 1}</h3>
                            <p className="text-sm text-gray-500">A brief summary of the blog post content goes here...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const CommunitiesSection: React.FC<{ content: CommunitiesContent }> = ({ content }) => (
    <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h2>
                {content.subtitle && (
                    <p className="text-gray-500">{content.subtitle}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.communities.map((community, i) => (
                    <a key={i} href={community.link ?? '#'} className="group block relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-100">
                        {community.imageUrl && (
                            <img src={community.imageUrl} alt={community.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-xl font-bold mb-2">{community.name}</h3>
                            <p className="text-gray-300 text-sm line-clamp-2">{community.description}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    </section>
);

const ListingsSection: React.FC<{ content: ListingsSectionContent }> = ({ content }) => {
    const [listings, setListings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const configData = await listingSectionService.getConfigById(content.configId);
                if (configData) {
                    setConfig(configData);
                    const data = await listingService.getBySectionConfig(configData.filters, configData.limit, configData.sort);
                    setListings(data);
                }
            } catch (error) {
                console.error('Failed to fetch listings for section', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [content.configId]);

    const breadcrumbItems = ['Home'];
    if (config?.filters) {
        // Build dynamic breadcrumb based on filters
        if (config.filters.city) breadcrumbItems.push(config.filters.city);
        if (config.filters.propertyType) {
            const type = config.filters.propertyType.replace('_', ' ').toLowerCase();
            breadcrumbItems.push(type.charAt(0).toUpperCase() + type.slice(1) + 's');
        }
        if (config.filters.status) {
            breadcrumbItems.push(config.filters.status);
        }
    } else if (content.breadcrumbLabel) {
        breadcrumbItems.push(content.breadcrumbLabel);
    }

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Dynamic Breadcrumb — Premium real estate style */}
                <nav className="flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {breadcrumbItems.map((item, i) => (
                        <React.Fragment key={i}>
                            <span className={`transition-colors duration-300 ${i === breadcrumbItems.length - 1 ? 'text-indigo-600 italic font-black underline underline-offset-4 decoration-amber-500/50' : 'hover:text-slate-900 cursor-default'}`}>{item}</span>
                            {i < breadcrumbItems.length - 1 && (
                                <svg className="w-2 h-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </React.Fragment>
                    ))}
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Dynamic Property Feed</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">
                            {content.title || 'Curated Portfolio'}
                        </h2>
                        {content.subtitle && (
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                {content.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-[450px] bg-slate-50 rounded-[40px] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={{
                                    ...listing,
                                    mainImage: listing.images?.[0] || '',
                                } as any}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black italic">No matching properties found for current filters.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const AgentsSection: React.FC<{ content: AgentsContent; organizationId?: string }> = ({ content, organizationId }) => {
    const [agents, setAgents] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAgents = async () => {
            if (!organizationId) {
                setLoading(false);
                return;
            }
            try {
                const data = await agentService.getAgentsByOrganization(organizationId);
                // If specific agents are selected in config, filter them
                if (content.agentIds && content.agentIds.length > 0) {
                    setAgents(data.filter(a => content.agentIds?.includes(a.id)));
                } else {
                    setAgents(data);
                }
            } catch (error) {
                console.error('Failed to fetch agents', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, [organizationId, content.agentIds]);

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">The Human Element</span>
                        <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter">
                        {content.title || 'Meet Our <span className="text-indigo-600">Experts</span>'}
                    </h2>
                    {content.subtitle && (
                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            {content.subtitle}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-96 bg-white rounded-[40px] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : agents.length > 0 ? (
                    <div className={`grid gap-8 ${content.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'flex overflow-x-auto pb-8 snap-x'}`}>
                        {agents.map((agent) => (
                            <div key={agent.id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col snap-start">
                                <div className="aspect-[4/5] overflow-hidden relative">
                                    <img
                                        src={agent.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                                        alt={agent.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                                        <div className="space-y-3">
                                            <p className="text-white/80 text-xs font-medium leading-relaxed line-clamp-3 italic">
                                                "{agent.bio}"
                                            </p>
                                            <div className="flex gap-2">
                                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </button>
                                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase italic">{agent.name}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{agent.role || 'Licensed Associate'}</p>
                                    <div className="pt-4 flex items-center gap-2">
                                        <div className="h-0.5 w-4 bg-indigo-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">View Portfolio</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black italic">Team members are currently being curated.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

// ═══════════════════════════════════════════════════════════
//  SECTION RENDERER
// ═══════════════════════════════════════════════════════════

function renderSection(section: SectionConfig, organizationId?: string): React.ReactNode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = section.content as any;

    switch (section.type) {
        case 'hero':
            return <HeroSection content={content} />;
        case 'featured_listings':
            return <FeaturedListingsSection content={content} />;
        case 'stats':
            return <StatsSection content={content} />;
        case 'how_it_works':
            return <HowItWorksSection content={content} />;
        case 'testimonials':
            return <TestimonialsSection content={content} />;
        case 'contact_cta':
            return <ContactCtaSection content={content} />;
        case 'newsletter':
            return <NewsletterSection content={content} />;
        case 'about_banner':
            return <AboutBannerSection content={content} />;
        case 'gallery':
            return <GallerySection content={content} />;
        case 'blog_preview':
            return <BlogPreviewSection content={content} />;
        case 'communities':
            return <CommunitiesSection content={content} />;
        case 'listings':
            return <ListingsSection content={content} />;
        case 'agents':
            return <AgentsSection content={content} organizationId={organizationId} />;
        default:
            console.warn(`[SectionRenderer] Unknown section type: "${section.type}"`);
            return null;
    }
}

export const SectionRenderer: React.FC<{ sections: SectionConfig[]; organizationId?: string }> = ({ sections, organizationId }) => {
    return (
        <div className="w-full">
            {sections
                .filter(s => s.isVisible)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                    <React.Fragment key={section.id}>
                        {renderSection(section, organizationId)}
                    </React.Fragment>
                ))}
        </div>
    );
};
