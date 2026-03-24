/**
 * SHARED MLS FORMATTING UTILITIES 
 * Designed to prevent hydration errors by using fixed locales.
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('en-CA');

/**
 * Format listing price or lease amount
 */
export function formatMLSPrice(price: number | null, leaseAmount?: number | null): string {
    if (price) {
        return CURRENCY_FORMATTER.format(price);
    }
    if (leaseAmount) {
        return `${CURRENCY_FORMATTER.format(leaseAmount)}/mo`;
    }
    return 'Price on Request';
}

/**
 * Format numbers with thousands separators (e.g., sqft, tax)
 */
export function formatMLSNumber(num: number | null | undefined): string {
    if (num == null) return '--';
    return NUMBER_FORMATTER.format(num);
}
