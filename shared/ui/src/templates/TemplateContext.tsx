'use client';

import React, { createContext, useContext } from 'react';
import { TemplateName } from './TemplateRenderer';


interface TemplateContextType {
    templateId: TemplateName;
    navigation?: any[];
    currentPageSlug?: string;
    onNavigate?: (slug: string) => void;
    organizationName?: string;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{
    templateId: TemplateName;
    navigation?: any;
    currentPageSlug?: string;
    onNavigate?: (slug: string) => void;
    organizationName?: string;
    children: React.ReactNode;
}> = ({
    templateId,
    navigation: rawNavigation,
    currentPageSlug,
    onNavigate,
    organizationName,
    children,
}) => {
        const navigation = Array.isArray(rawNavigation)
            ? rawNavigation
            : rawNavigation?.headerLinks || [];

        return (
            <TemplateContext.Provider value={{ templateId, navigation, currentPageSlug, onNavigate, organizationName }}>
                {children}
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
            organizationName: ''
        };
    }
    return context;
};
