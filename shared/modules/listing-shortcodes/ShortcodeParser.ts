

/**
 * Utility to parse shortcode strings in templates
 * Example: [listings config="featuredHomes"]
 */
export class ShortcodeParser {
    static parse(content: string): { type: string, attributes: Record<string, string> }[] {
        const shortcodeRegex = /\[(\w+)\s+([^\]]+)\]/g;
        const results = [];
        let match;

        while ((match = shortcodeRegex.exec(content)) !== null) {
            const type = match[1];
            const attrString = match[2];
            const attributes: Record<string, string> = {};

            const attrRegex = /(\w+)="([^"]+)"/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrString)) !== null) {
                attributes[attrMatch[1]] = attrMatch[2];
            }

            results.push({ type, attributes });
        }

        return results;
    }

    static stringify(type: string, attributes: Record<string, any>): string {
        const attrString = Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `[${type} ${attrString}]`;
    }
}
