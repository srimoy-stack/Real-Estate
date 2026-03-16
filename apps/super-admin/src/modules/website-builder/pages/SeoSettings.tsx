'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Select } from '@repo/ui';
import { SeoSerpPreview } from '../components/SeoSerpPreview';
import { SeoSocialPreview } from '../components/SeoSocialPreview';

export const SeoSettings: React.FC = () => {
    const [title, setTitle] = useState('Modern Luxury Estate | Prestige Realty');
    const [description, setDescription] = useState('Discover high-end luxury real estate and exclusive property listings. Your gateway to extraordinary living and architectural masterpieces.');

    const robotsOptions = [
        { label: 'Index, Follow (Standard)', value: 'index,follow' },
        { label: 'No-Index, Follow (Development)', value: 'noindex,follow' },
        { label: 'No-Index, No-Follow (Private)', value: 'noindex,nofollow' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Signal Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        SEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 italic">Visibility</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Optimize your global search presence. Configure crawler behavior, meta descriptors, and social sharing signatures.
                    </p>
                </div>
                <Button size="xl" className="shadow-rose-500/10 hover:bg-rose-600">
                    Sync Meta Definitions
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <Card variant="standard" padding="lg" className="space-y-8">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Meta Configuration</h2>

                        <Input
                            label="Default Title Signature"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <Textarea
                            label="Global Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Select
                                label="Robots Policy"
                                options={robotsOptions}
                            />
                            <Input
                                label="Canonical Lock"
                                placeholder="https://prestigerealty.com"
                            />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <SeoSerpPreview title={title} description={description} />
                    <SeoSocialPreview />
                </div>
            </div>
        </div>
    );
};
