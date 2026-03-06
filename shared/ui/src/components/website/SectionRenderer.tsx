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
} from '@repo/types';

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

const FeaturedListingsSection: React.FC<{ content: FeaturedListingsContent }> = ({ content }) => (
    <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title || 'Featured Listings'}</h2>
                    {content.subtitle && (
                        <p className="text-gray-500">{content.subtitle}</p>
                    )}
                </div>
                <a
                    href="/listings"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    View All Listings →
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(content.maxItems, 3) }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500 rounded-md text-[11px] font-semibold text-white">
                                For Sale
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                                <span className="text-[10px] font-medium text-white">12</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-0.5">Premium Property {i + 1}</h3>
                            <p className="text-sm text-gray-500 mb-3">Toronto, Ontario</p>
                            <p className="text-xl font-bold text-gray-900 mb-2">$4,250,000</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
                                <span>5 bed</span>
                                <span>4 bath</span>
                                <span>3,200 sqft</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

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

// ═══════════════════════════════════════════════════════════
//  SECTION RENDERER
// ═══════════════════════════════════════════════════════════

function renderSection(section: SectionConfig): React.ReactNode {
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
        default:
            console.warn(`[SectionRenderer] Unknown section type: "${section.type}"`);
            return null;
    }
}

export const SectionRenderer: React.FC<{ sections: SectionConfig[] }> = ({ sections }) => {
    return (
        <div className="w-full">
            {sections
                .filter(s => s.isVisible)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                    <React.Fragment key={section.id}>
                        {renderSection(section)}
                    </React.Fragment>
                ))}
        </div>
    );
};
