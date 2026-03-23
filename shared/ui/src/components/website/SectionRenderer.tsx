'use client';

import React from 'react';
import type {
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
import { listingService, listingSectionService, agentService, mlsListingService as listingsService } from '@repo/services';

// ═══════════════════════════════════════════════════════════
//  SECTION COMPONENTS — Zolo-inspired clean design
//  Palette: White backgrounds, gray text, green accents
// ═══════════════════════════════════════════════════════════

const HeroSection: React.FC<{ content?: HeroContent; headline?: string; subheadline?: string; buttonText?: string; bgImage?: string }> = (props) => {
    const content = props.content || props;
    return (
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
};

const FeaturedListingsSection: React.FC<{
    content?: FeaturedListingsContent;
    filters?: any;
    city?: string;
    propertyType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    title?: string;
    subtitle?: string;
}> = (props) => {
    const { filters: propsFilters, city, propertyType, status, minPrice, maxPrice, limit, title, subtitle } = props;
    const content = props.content || (props as any);
    const [listings, setListings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // If specific listing IDs are provided in content, use them.
                if (content?.listingIds && content.listingIds.length > 0) {
                    const response = await listingsService.getListings({ ids: content.listingIds });
                    setListings(response.listings.map((l: any) => ({ ...l, id: l.mlsNumber })));
                    return;
                }

                // Otherwise, use dynamic filters (checking both flattened and nested props)
                const activeCity = city || propsFilters?.city;
                const activeType = propertyType || propsFilters?.propertyType;
                const activeStatus = status || propsFilters?.status;
                const activeMin = minPrice !== undefined ? minPrice : propsFilters?.minPrice;
                const activeMax = maxPrice !== undefined ? maxPrice : propsFilters?.maxPrice;

                const filters = {
                    city: activeCity,
                    propertyType: activeType as any,
                    status: activeStatus as any,
                    minPrice: activeMin,
                    maxPrice: activeMax,
                    featured: true,
                    limit: limit || content?.maxItems || 3
                };

                const response = await listingsService.getListings(filters);
                setListings(response.listings.map((l: any) => ({ ...l, id: l.mlsNumber })));
            } catch (error) {
                console.error('Failed to fetch featured listings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, [content?.listingIds, content?.maxItems, city, propsFilters, propertyType, status, minPrice, maxPrice, limit]);

    const displayTitle = title || content?.title || 'Featured Residences';
    const displaySubtitle = subtitle || content?.subtitle;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-10 bg-amber-500 rounded-full" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 ">Curated Collection</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none ">
                            {displayTitle}
                        </h2>
                        {displaySubtitle && (
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                {displaySubtitle}
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
                        <p className="text-slate-400 font-black ">No featured selections available at this time.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const StatsSection: React.FC<{ content?: StatsContent; title?: string; stats?: { value: string; label: string }[] }> = (props) => {
    const content = props.content || props;
    return (
        <section className="py-16 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-10 text-center">
                    {content.title || 'Market Impact'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {content.stats?.map((stat, i) => (
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
};

const HowItWorksSection: React.FC<{ content?: HowItWorksContent; title?: string; steps?: { icon: string; heading: string; description: string }[] }> = (props) => {
    const content = props.content || props;
    return (
        <section className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-12">{content.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {content.steps?.map((step, i) => (
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
};

const TestimonialsSection: React.FC<{ content?: TestimonialsContent; title?: string; testimonials?: any[] }> = (props) => {
    const content = props.content || props;
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">{content.title}</h2>
                {content.testimonials && content.testimonials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {content.testimonials.map((testimonial: any) => (
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
};

const ContactCtaSection: React.FC<{ content?: ContactCtaContent; title?: string; description?: string; buttonLabel?: string; buttonHref?: string }> = (props) => {
    const content = props.content || (props as any);
    return (
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
};

const NewsletterSection: React.FC<{ content?: NewsletterContent; title?: string; subtitle?: string; buttonLabel?: string; placeholder?: string }> = (props) => {
    const content = props.content || (props as any);
    return (
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
};

const AboutBannerSection: React.FC<{ content?: AboutBannerContent; title?: string; description?: string; buttonText?: string; buttonHref?: string; imageUrl?: string }> = (props) => {
    const content = props.content || (props as any);
    return (
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
};

const GallerySection: React.FC<{ content?: GalleryContent; title?: string; layout?: 'grid' | 'masonry'; images?: { url: string; caption?: string }[] }> = (props) => {
    const content = props.content || (props as any);
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{content.title}</h2>
                <div className={`grid gap-2 ${content.layout === 'masonry' ? 'columns-2 md:columns-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {content.images?.map((img: any, i: number) => (
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
};

const BlogPreviewSection: React.FC<{ content?: BlogPreviewContent; title?: string; subtitle?: string; maxPosts?: number }> = (props) => {
    const content = props.content || (props as any);
    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">{content.title}</h2>
                {content.subtitle && (
                    <p className="text-gray-500 text-center mb-10">{content.subtitle}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: content.maxPosts || 0 }).map((_, i) => (
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
};

const CommunitiesSection: React.FC<{ content?: CommunitiesContent; title?: string; subtitle?: string; communities?: any[] }> = (props) => {
    const content = props.content || (props as any);
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h2>
                    {content.subtitle && (
                        <p className="text-gray-500">{content.subtitle}</p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.communities?.map((community: any, i: number) => (
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
};

const ListingsSection: React.FC<{
    content?: ListingsSectionContent;
    filters?: any;
    city?: string;
    propertyType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    title?: string;
    subtitle?: string;
    breadcrumbLabel?: string;
}> = (props) => {
    const { filters: propsFilters, city, propertyType, status, minPrice, maxPrice, limit, title, subtitle } = props;
    const content = props.content || (props as any);
    const [listings, setListings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine active filters (checking both flattened and nested props)
                const activeCity = city || propsFilters?.city;
                const activeType = propertyType || propsFilters?.propertyType;
                const activeStatus = status || propsFilters?.status;
                const activeMin = minPrice !== undefined ? minPrice : propsFilters?.minPrice;
                const activeMax = maxPrice !== undefined ? maxPrice : propsFilters?.maxPrice;

                // If any dynamic filters are provided, fetch using them.
                if (activeCity || activeType || activeStatus || activeMin || activeMax) {
                    const filters = {
                        city: activeCity,
                        propertyType: activeType as any,
                        status: activeStatus as any,
                        minPrice: activeMin,
                        maxPrice: activeMax,
                        limit: limit || 6
                    };
                    const response = await listingsService.getListings(filters);
                    // Ensure each listing has an 'id' for the ListingCard key
                    setListings(response.listings.map((l: any) => ({ ...l, id: l.mlsNumber })));
                } else if (content?.configId) {
                    // Existing behavior: fetch via configId
                    const configData = await listingSectionService.getConfigById(content.configId);
                    if (configData) {
                        setConfig(configData);
                        const data = await listingService.getBySectionConfig(configData.filters, configData.limit, configData.sort);
                        setListings(data);
                    }
                } else {
                    // Secondary safe fallback: fetch basic listings
                    const { listings: fallbackListings } = await listingsService.getListings({ limit: limit || 6 });
                    setListings(fallbackListings.map((l: any) => ({ ...l, id: l.mlsNumber })));
                }
            } catch (error) {
                console.error('Failed to fetch listings for section', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [content?.configId, city, propsFilters, propertyType, status, minPrice, maxPrice, limit]);

    const breadcrumbItems = ['Home'];
    const activeCity = city || config?.filters?.city;
    if (activeCity) {
        breadcrumbItems.push(activeCity);
    }

    const activePropertyType = propertyType || config?.filters?.propertyType;
    if (activePropertyType) {
        const type = activePropertyType.replace('_', ' ').toLowerCase();
        breadcrumbItems.push(type.charAt(0).toUpperCase() + type.slice(1) + 's');
    }

    const activeStatus = status || config?.filters?.status;
    if (activeStatus) {
        breadcrumbItems.push(activeStatus);
    }

    if (breadcrumbItems.length === 1 && content?.breadcrumbLabel) {
        breadcrumbItems.push(content.breadcrumbLabel);
    }

    const displayTitle = title || content?.title || 'Curated Portfolio';
    const displaySubtitle = subtitle || content?.subtitle;

    const finalListings = limit ? listings.slice(0, limit) : listings;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Dynamic Breadcrumb — Premium real estate style */}
                <nav className="flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {breadcrumbItems.map((item, i) => (
                        <React.Fragment key={i}>
                            <span className={`transition-colors duration-300 ${i === breadcrumbItems.length - 1 ? 'text-indigo-600  font-black underline underline-offset-4 decoration-amber-500/50' : 'hover:text-slate-900 cursor-default'}`}>{item}</span>
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
                        <h2 className="text-5xl font-black text-slate-900  tracking-tighter leading-none">
                            {displayTitle}
                        </h2>
                        {displaySubtitle && (
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                {displaySubtitle}
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
                ) : finalListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {finalListings.map((listing) => (
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
                        <p className="text-slate-400 font-black ">No matching properties found for current filters.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const AgentsSection: React.FC<{ content?: AgentsContent; organizationId?: string; title?: string; subtitle?: string; agentIds?: string[]; layout?: 'grid' | 'carousel' }> = (props) => {
    const { organizationId } = props;
    const content = props.content || (props as any);
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
                if (content?.agentIds && content.agentIds.length > 0) {
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
    }, [organizationId, content?.agentIds]);

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">The Human Element</span>
                        <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900  tracking-tighter">
                        {content?.title || 'Meet Our Experts'}
                    </h2>
                    {content?.subtitle && (
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
                    <div className={`grid gap-8 ${content?.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'flex overflow-x-auto pb-8 snap-x'}`}>
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
                                            <p className="text-white/80 text-xs font-medium leading-relaxed line-clamp-3 ">
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
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase ">{agent.name}</h3>
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
                        <p className="text-slate-400 font-black ">Team members are currently being curated.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const ListingDetail: React.FC<any> = ({ listing }) => {
    if (!listing) return <div className="py-20 text-center text-slate-400 font-bold ">Listing details are currently unavailable.</div>;
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-video rounded-[40px] overflow-hidden bg-slate-100 shadow-2xl border border-slate-100">
                    <img src={listing.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600'} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 ">Property Details</span>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-6 ">{listing.title}</h1>
                        <p className="text-2xl font-bold text-slate-400 mt-2">{listing.city}, Ontario</p>
                    </div>
                    <div className="py-8 border-y border-slate-100">
                        <p className="text-5xl font-black text-indigo-600 tracking-tighter ">${listing.price?.toLocaleString()}</p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Current Active Listing</p>
                    </div>
                    <div className="flex gap-12 pt-4">
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 ">{listing.beds}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center">Beds</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 ">{listing.baths}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center">Baths</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 ">{listing.sqft || '2,400'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center font-mono">Sq. Ft.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const AgentDetail: React.FC<any> = ({ agent }) => {
    if (!agent) return <div className="py-20 text-center text-slate-400 font-bold ">Agent profile is currently unavailable.</div>;
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border-8 border-white group relative">
                    <img src={agent.profilePhoto || agent.image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'} alt={agent.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                        <p className="text-white text-lg font-medium  leading-relaxed line-clamp-4">"{agent.bio}"</p>
                    </div>
                </div>
                <div className="space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 ">Top Tier Agent</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter  leading-[0.9]">{agent.name}</h1>
                        <p className="text-2xl font-bold text-slate-400 mt-4">{agent.role || 'Licensed Real Estate Professional'}</p>
                    </div>
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-6">
                        <p className="text-xl text-slate-500 font-medium leading-relaxed ">"{agent.bio || 'Dedicated to providing exceptional service and superior results for clients across the region.'}"</p>
                        <div className="pt-6 flex flex-wrap gap-4">
                            <button className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs ">Connect with {agent.name.split(' ')[0]}</button>
                            <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs ">View Listings</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ═══════════════════════════════════════════════════════════
//  SECTION RENDERER
// ═══════════════════════════════════════════════════════════

function renderSection(section: any, organizationId?: string, components?: Record<string, React.FC<any>>, context?: Record<string, any>): React.ReactNode {
    if (!section) return null;

    const type = section.type;
    const config = section.config || (section.content ? { content: section.content } : { content: {} });

    // Try to find an override in components provided by the template
    // Templates export them as 'Hero', 'Listings', etc.
    const overrideKeys = [
        type,
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(), // e.g. 'hero' -> 'Hero'
        type.replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase()), // e.g. 'featured_listings' -> 'featuredListings'
        (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()).replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase()), // e.g. 'featured_listings' -> 'FeaturedListings'
        type.toLowerCase().endsWith('section') ? type.slice(0, -7) : type + 'Section',
    ];

    if (components) {
        for (const key of overrideKeys) {
            if (components[key]) {
                const Component = components[key];
                return <Component {...config} organizationId={organizationId} {...context} />;
            }
        }
    }

    // Map of logical types to internal component keys
    const typeToComponent: Record<string, string> = {
        'hero': 'HeroSection',
        'herosection': 'HeroSection',
        'listings': 'ListingsSection',
        'listingssection': 'ListingsSection',
        'featured_listings': 'FeaturedListingsSection',
        'featuredlistingssection': 'FeaturedListingsSection',
        'stats': 'StatsSection',
        'statssection': 'StatsSection',
        'how_it_works': 'HowItWorksSection',
        'testimonials': 'TestimonialsSection',
        'testimonialssection': 'TestimonialsSection',
        'contact_cta': 'ContactCtaSection',
        'newsletter': 'NewsletterSection',
        'about_banner': 'AboutBannerSection',
        'gallery': 'GallerySection',
        'blog_preview': 'BlogPreviewSection',
        'communities': 'CommunitiesSection',
        'communitiessection': 'CommunitiesSection',
        'agents': 'AgentsSection',
        'agentbio': 'AgentsSection',
        'agentprofilessection': 'AgentsSection',
        'text': 'AboutBannerSection',
        'about': 'AboutBannerSection',
        'textsection': 'AboutBannerSection',
        'contact': 'ContactCtaSection',
        'contactsection': 'ContactCtaSection',
        'listing_detail': 'ListingDetail',
        'listingdetail': 'ListingDetail',
        'agent_detail': 'AgentDetail',
        'agentdetail': 'AgentDetail',
    };

    const componentKey = typeToComponent[type?.toLowerCase()] || type;

    switch (componentKey) {
        case 'HeroSection':
            return <HeroSection {...config} />;
        case 'FeaturedListingsSection':
            return <FeaturedListingsSection {...config} />;
        case 'StatsSection':
            return <StatsSection {...config} />;
        case 'HowItWorksSection':
            return <HowItWorksSection {...config} />;
        case 'TestimonialsSection':
            return <TestimonialsSection {...config} />;
        case 'ContactCtaSection':
            return <ContactCtaSection {...config} />;
        case 'NewsletterSection':
            return <NewsletterSection {...config} />;
        case 'AboutBannerSection':
            return <AboutBannerSection {...config} />;
        case 'GallerySection':
            return <GallerySection {...config} />;
        case 'BlogPreviewSection':
            return <BlogPreviewSection {...config} />;
        case 'CommunitiesSection':
            return <CommunitiesSection {...config} />;
        case 'ListingsSection':
            return <ListingsSection {...config} />;
        case 'AgentsSection':
            return <AgentsSection {...config} organizationId={organizationId} />;
        case 'ListingDetail':
            // Assuming ListingDetail component expects a 'listing' prop from context
            return <ListingDetail {...config} {...context} />;
        case 'AgentDetail':
            // Assuming AgentDetail component expects an 'agent' prop from context
            return <AgentDetail {...config} {...context} />;
        default:
            console.warn(`[SectionRenderer] Unknown section type: "${type}" (resolved to "${componentKey}")`);
            return null;
    }
}


export const SectionRenderer: React.FC<{
    sections: any[];
    organizationId?: string;
    components?: Record<string, React.FC<any>>;
    context?: Record<string, any>;
}> = ({ sections, organizationId, components, context }) => {
    return (
        <div className="w-full">
            {sections
                .filter(s => s.isVisible)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section) => (
                    <React.Fragment key={section.id}>
                        {renderSection(section, organizationId, components, context)}
                    </React.Fragment>
                ))}
        </div>
    );
};
