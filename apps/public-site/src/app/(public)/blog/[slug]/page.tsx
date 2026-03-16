import React from 'react';
import { notFound } from 'next/navigation';
import { blogService } from '@repo/services';
import Link from 'next/link';

interface PostPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PostPageProps) {
    const post = await blogService.getPostBySlug(params.slug);
    if (!post) return { title: 'Post Not Found' };
    return {
        title: `${post.title} | Our Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: PostPageProps) {
    const post = await blogService.getPostBySlug(params.slug);
    if (!post) return notFound();

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Hero */}
            <article className="pt-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <nav className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Link href="/" className="hover:text-indigo-600">Home</Link>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-slate-900 italic">{post.category}</span>
                    </nav>

                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <img src={post.authorImage} alt={post.author} className="h-12 w-12 rounded-full border-2 border-slate-100 shadow-md" />
                                <div>
                                    <p className="text-sm font-black text-slate-900">{post.author}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date} • {post.readTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="prose prose-slate prose-xl max-w-none prose-h2:tracking-tighter prose-h2:font-black prose-p:leading-relaxed prose-p:text-slate-600 prose-blockquote:border-l-indigo-600 prose-blockquote:bg-indigo-50/50 prose-blockquote:p-8 prose-blockquote:rounded-2xl pb-32">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        <p>
                            Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper.
                        </p>
                        <p>
                            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.
                        </p>

                        <blockquote>
                            "The best investment on earth is earth itself. Real estate is the basis of all wealth."
                        </blockquote>

                        <p>
                            Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla.
                        </p>
                    </div>
                </div>
            </article>

            {/* Back CTA */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        Back to Articles
                    </Link>
                </div>
            </section>
        </div>
    );
}
