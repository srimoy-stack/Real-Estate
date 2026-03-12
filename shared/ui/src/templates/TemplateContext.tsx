'use client';

import React, { createContext, useContext } from 'react';
import { TemplateName } from './TemplateRenderer';

interface TemplateContextType {
    templateId: TemplateName;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ templateId: TemplateName; children: React.ReactNode }> = ({
    templateId,
    children,
}) => {
    return (
        <TemplateContext.Provider value={{ templateId }}>
            {children}
        </TemplateContext.Provider>
    );
};

export const useTemplate = () => {
    const context = useContext(TemplateContext);
    if (!context) {
        // Fallback or error? Let's default to modern-realty if not in context
        return { templateId: 'modern-realty' as TemplateName };
    }
    return context;
};
