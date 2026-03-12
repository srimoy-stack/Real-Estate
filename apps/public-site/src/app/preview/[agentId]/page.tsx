'use client';

import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { websiteInstanceService } from '@repo/services';
import * as Sections from '@repo/ui';
import { ModernSectionRenderer } from '@/components/section-renderer';

export default function PreviewPage({ params }: { params: { agentId: string } }) {
    const [website, setWebsite] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            try {
                const data = await websiteInstanceService.getWebsiteByAgentId(params.agentId);
                setWebsite(data);
            } catch (err) {
                console.error('Failed to load preview:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [params.agentId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 mx-auto border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Entering Signature Environment...</p>
                </div>
            </div>
        );
    }

    if (!website) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
                <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg mx-6">
                    <div className="h-20 w-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 font-black text-3xl">!</div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Environment Not Found</h2>
                    <p className="text-slate-500 mt-4 font-medium leading-relaxed">The requested agent profile or website configuration could not be synchronized with the local environment.</p>
                </div>
            </div>
        );
    }

    // Use Craft.js if customLayoutJson exists, otherwise fallback to standard renderer
    if (website.layoutConfig?.customLayoutJson) {
        return (
            <div className="min-h-screen">
                <Editor resolver={Object.entries(Sections).reduce((acc, [key, value]) => {
                    // Only include things that look like React components and aren't namespaced modules
                    if (typeof value === 'function' && key[0] === key[0].toUpperCase()) {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as any)} enabled={false}>
                    <Frame data={website.layoutConfig.customLayoutJson} />
                </Editor>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <ModernSectionRenderer layoutConfig={website.layoutConfig} />
        </div>
    );
}
