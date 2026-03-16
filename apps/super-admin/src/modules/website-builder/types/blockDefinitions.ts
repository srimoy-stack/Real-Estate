import { BlockType } from '@repo/types';

export const BLOCK_DEFINITIONS: Record<BlockType, { name: string; icon: string; defaultContent: any }> = {
    text: { name: 'Rich Text', icon: 'T', defaultContent: { text: 'Enter your content here...' } },
    image: { name: 'Full Image', icon: 'I', defaultContent: { url: '', caption: '' } },
    text_image: { name: 'Text + Image', icon: 'TI', defaultContent: { text: '', url: '', layout: 'left' } },
    cta: { name: 'Call to Action', icon: '!', defaultContent: { label: 'Click Here', href: '#' } },
    gallery: { name: 'Image Gallery', icon: 'G', defaultContent: { images: [] } },
    video: { name: 'Video Embed', icon: 'V', defaultContent: { url: '', platform: 'youtube' } },
};
