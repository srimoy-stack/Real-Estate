'use client';

import React from 'react';
import WebsiteBuilderPage from '@repo/modules/website-builder/WebsiteBuilderPage';

export default function Page({ params }: { params: { id: string } }) {
    return <WebsiteBuilderPage pageId={params.id} />;
}
