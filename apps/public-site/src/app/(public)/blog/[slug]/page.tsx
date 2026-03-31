import { Metadata } from 'next';
import { blogService } from '@repo/services';
import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

interface BlogPostPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const website = getWebsiteFromHeaders() as any;
    if (!website) return {};

    const post = await blogService.getPostBySlug(website.tenantId, params.slug);
    if (!post) return { title: 'Post Not Found' };

    const seo = post.seo;
    const title = seo?.metaTitle || `${post.title} | ${website.brandName}`;
    const description = seo?.metaDescription || post.excerpt;

    return {
        title,
        description,
        openGraph: {
            title: seo?.ogTitle || title,
            description: seo?.ogDescription || description,
            images: seo?.ogImage ? [{ url: seo.ogImage }] : (post.featuredImage ? [{ url: post.featuredImage }] : []),
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
        },
        alternates: {
            canonical: seo?.canonicalUrl || `https://${website.domain}/blog/${post.slug}`,
        }
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const website = getWebsiteFromHeaders() as any;
    if (!website) return null;

    const post = await blogService.getPostBySlug(website.tenantId, params.slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
                <h1 className="text-4xl font-black text-slate-900 mb-4 text-center">Article Not Found</h1>
                <p className="text-slate-500 mb-8 max-w-md text-center">The story you&apos;re looking for might have been moved or unpublished.</p>
                <Link href="/blog" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
                    Back to Journal
                </Link>
            </div>
        );
    }

    const { title, content, featuredImage, author, publishedAt, category } = post;

    return (
        <article className="min-h-screen bg-white">
            {/* Post Hero */}
            <header className="pt-40 pb-20 overflow-hidden bg-slate-50 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {category}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] max-w-3xl">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-200 mt-10">
                        <div className="flex flex-col items-center">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{author}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                                Published {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            {featuredImage && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                    <div className="aspect-[21/9] rounded-[48px] overflow-hidden shadow-2xl shadow-slate-300 relative">
                        <SafeImage
                            src={featuredImage}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Post Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div
                    className="prose prose-slate prose-lg max-w-none 
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                        prose-a:text-indigo-600 prose-a:font-black prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-[32px] prose-img:shadow-2xl
                        prose-ul:list-disc prose-li:font-medium prose-li:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Post Footer */}
                <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Share this story</span>
                        <div className="flex gap-4">
                            {['Twitter', 'Facebook', 'LinkedIn'].map(p => (
                                <button key={p} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                    <span className="sr-only">{p}</span>
                                    <div className="w-4 h-4 bg-current rounded-sm" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <Link href="/blog" className="text-sm font-black text-slate-900 hover:text-indigo-600 flex items-center gap-2 transition-colors uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to all articles
                    </Link>
                </footer>
            </div>
        </article>
    );
}
