'use client';

import React, { createContext, useContext } from 'react';
import { TemplateName } from './TemplateRenderer';


interface TemplateContextType {
    templateId: TemplateName;
    navigation?: any[];
    currentPageSlug?: string;
    onNavigate?: (slug: string) => void;
    organizationName?: string;
    isEditor?: boolean;
    pageSections?: Record<string, any[]>;
    branding?: {
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        headerButtonText?: string;
        headerLayout?: 'logo-left' | 'logo-center' | 'minimal';
        showHeaderButton?: boolean;
        headerButtons?: { label: string; slug: string; variant?: 'primary' | 'secondary' | 'outline' }[];
    };
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{
    templateId: TemplateName;
    navigation?: any;
    currentPageSlug?: string;
    onNavigate?: (slug: string) => void;
    organizationName?: string;
    isEditor?: boolean;
    pageSections?: Record<string, any[]>;
    branding?: {
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        headerButtonText?: string;
        headerLayout?: 'logo-left' | 'logo-center' | 'minimal';
        showHeaderButton?: boolean;
        headerButtons?: { label: string; slug: string; variant?: 'primary' | 'secondary' | 'outline' }[];
    };
    children: React.ReactNode;
}> = ({
    templateId,
    navigation: rawNavigation,
    currentPageSlug,
    onNavigate,
    organizationName,
    isEditor: providedIsEditor,
    pageSections,
    branding,
    children,
}) => {
        const isEditor = providedIsEditor || !!onNavigate;
        const navigation = Array.isArray(rawNavigation)
            ? rawNavigation
            : rawNavigation?.headerLinks || [];

        const handleInterceptLinks = (e: React.MouseEvent) => {
            // If we have onNavigate, we're likely in the builder. Intercept ALL internal links.
            if (!onNavigate) return;

            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor) {
                const href = anchor.getAttribute('href');
                // If it's a relative link or an internal absolute link
                if (href && (href.startsWith('/') || href.startsWith('#') || href.startsWith(window.location.origin))) {
                    // Only skip empty or very short hashes
                    if (href === '#') return;

                    e.preventDefault();
                    e.stopPropagation();

                    // Hash links: pass directly (e.g. #about → onNavigate('#about'))
                    // Absolute internal links: extract pathname
                    // Relative links: pass as-is (e.g. 'about')
                    let slug: string;
                    if (href.startsWith('#')) {
                        slug = href; // preserve hash for builder's normalize()
                    } else if (href.startsWith('/')) {
                        slug = href;
                    } else {
                        try { slug = new URL(href, window.location.origin).pathname; } catch { slug = href; }
                    }
                    onNavigate(slug);
                }
            }
        };

        return (
            <TemplateContext.Provider value={{ templateId, navigation, currentPageSlug, onNavigate, organizationName, isEditor, pageSections, branding }}>
                <div onClickCapture={handleInterceptLinks} className="template-provider-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    {children}
                </div>
            </TemplateContext.Provider>
        );
    };

export const useTemplate = () => {
    const context = useContext(TemplateContext);
    if (!context) {
        return {
            templateId: 'modern-realty' as TemplateName,
            navigation: [],
            currentPageSlug: '/',
            onNavigate: undefined,
            organizationName: '',
            isEditor: false,
            pageSections: {},
            branding: {}
        };
    }
    return context;
};
