import React from 'react';
import { ListingShortcode } from './ListingShortcode';

interface ShortcodeRendererProps {
    content: string;
}

/**
 * A utility component that safely parses a string of content 
 * containing [listings ...] shortcodes and renders the text + injected ListingShortcode instances.
 */
export const ShortcodeRenderer: React.FC<ShortcodeRendererProps> = ({ content }) => {
    if (!content) return null;

    // Match the entire shortcode block: [listings param="value" limit="4"]
    const shortcodeRegex = /\[listings([^\]]*)\]/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = shortcodeRegex.exec(content)) !== null) {
        // 1. Push any text content found before this shortcode match
        if (match.index > lastIndex) {
            const textChunk = content.slice(lastIndex, match.index);
            parts.push(
                <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: textChunk }} />
            );
        }

        // 2. Parse the attributes string exactly
        // Extract: param="value" or param='value' or just param=value
        const attrString = match[1];
        const attributes: Record<string, string> = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
            const paramName = attrMatch[1];
            const paramValue = attrMatch[2];
            attributes[paramName] = paramValue;
        }

        // 3. Mount the dynamic React Component in place of the shortcode
        parts.push(
            <div key={`shortcode-${match.index}`} className="my-10 w-full overflow-hidden">
                <ListingShortcode attributes={attributes} />
            </div>
        );

        lastIndex = shortcodeRegex.lastIndex;
    }

    // 4. Push any remaining text after the final shortcode
    if (lastIndex < content.length) {
        const trailingText = content.slice(lastIndex);
        parts.push(
            <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: trailingText }} />
        );
    }

    return (
        <div className="shortcode-content leading-relaxed">
            {parts}
        </div>
    );
};
