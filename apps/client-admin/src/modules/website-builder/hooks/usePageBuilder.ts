import { useState } from 'react';
import { CustomPage, PageBlock, BlockType } from '@repo/types';

const SYSTEM_RESERVED_SLUGS = ['search', 'listings', 'dashboard', 'login', 'admin', 'api'];

export const usePageBuilder = (initialPage: CustomPage) => {
    const [page, setPage] = useState<CustomPage>(initialPage);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [slugError, setSlugError] = useState('');

    const validateSlug = (slug: string) => {
        if (SYSTEM_RESERVED_SLUGS.includes(slug.toLowerCase())) {
            setSlugError('This is a reserved system URL.');
            return false;
        }
        setSlugError('');
        return true;
    };

    const addBlock = (type: BlockType, defaultContent: any) => {
        const newBlock: PageBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: { ...defaultContent },
            order: page.blocks.length
        };
        setPage({ ...page, blocks: [...page.blocks, newBlock] });
        setActiveBlockId(newBlock.id);
    };

    const removeBlock = (id: string) => {
        setPage({ ...page, blocks: page.blocks.filter(b => b.id !== id) });
        if (activeBlockId === id) setActiveBlockId(null);
    };

    const updateBlockContent = (id: string, newContent: any) => {
        setPage({
            ...page,
            blocks: page.blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b)
        });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...page.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setPage({ ...page, blocks: newBlocks.map((b, i) => ({ ...b, order: i })) });
    };

    const updatePageMeta = (updates: Partial<CustomPage>) => {
        setPage(prev => ({ ...prev, ...updates }));
    };

    const updateSeo = (updates: Partial<CustomPage['seo']>) => {
        setPage(prev => ({ ...prev, seo: { ...prev.seo, ...updates } }));
    };

    const activeBlock = page.blocks.find(b => b.id === activeBlockId);

    return {
        page,
        activeBlock,
        activeBlockId,
        setActiveBlockId,
        slugError,
        addBlock,
        removeBlock,
        updateBlockContent,
        moveBlock,
        updatePageMeta,
        updateSeo,
        validateSlug
    };
};
