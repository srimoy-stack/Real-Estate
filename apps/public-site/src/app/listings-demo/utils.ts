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

/**
 * Central Geo-Configuration for demo cities.
 * Maps city names to their respective DDF-compatible latitude/longitude viewports.
 */
export const GEO_BOUNDS: Record<string, { latitudeMin: number; latitudeMax: number; longitudeMin: number; longitudeMax: number }> = {
    'Toronto': {
        latitudeMin: 43.60,
        latitudeMax: 44.00,
        longitudeMin: -80.07,
        longitudeMax: -79.00,
    },
    'Montreal': {
        latitudeMin: 45.41,
        latitudeMax: 45.71,
        longitudeMin: -73.96,
        longitudeMax: -73.47,
    },
    'Vancouver': {
        latitudeMin: 49.19,
        latitudeMax: 49.31,
        longitudeMin: -123.27,
        longitudeMax: -123.02,
    },
    'Calgary': {
        latitudeMin: 50.84,
        latitudeMax: 51.21,
        longitudeMin: -114.31,
        longitudeMax: -113.85,
    },
    'Ottawa': {
        latitudeMin: 44.96,
        latitudeMax: 45.54,
        longitudeMin: -76.35,
        longitudeMax: -75.25,
    }
};

/**
 * Resolve a city name to its latitude/longitude bounding box.
 * Uses GEO_BOUNDS for mapped cities, defaulting to Toronto for demo stability.
 */
export function resolveGeoBounds(city: string): GeoBounds | null {
    if (!city) return null;

    // Direct lookup
    const bounds = GEO_BOUNDS[city];
    if (bounds) return bounds;

    // Normalize: strip parenthetical neighborhood  
    // "Toronto (East End-Danforth)" → "Toronto"
    const baseCity = city.replace(/\s*\(.*\)\s*$/, '').trim();
    if (baseCity && baseCity !== city) {
        const baseBounds = GEO_BOUNDS[baseCity];
        if (baseBounds) return baseBounds;
    }

    // Normalize: strip after comma/dash
    // "Toronto, ON" → "Toronto"
    const commaCity = city.split(/[,\-–—]/)[0].trim();
    if (commaCity && commaCity !== city && commaCity !== baseCity) {
        const commaBounds = GEO_BOUNDS[commaCity];
        if (commaBounds) return commaBounds;
    }

    // No match — let backend use name-based search
    return null;
}

/** Shared type for geo bounding box */
export type GeoBounds = {
    latitudeMin: number;
    latitudeMax: number;
    longitudeMin: number;
    longitudeMax: number;
};

/**
 * Expand a bounding box by a buffer on each side.
 * A buffer of 0.1° ≈ ~11 km in latitude.
 */
export function expandGeoBounds(bounds: GeoBounds, buffer: number = 0.1): GeoBounds {
    return {
        latitudeMin: bounds.latitudeMin - buffer,
        latitudeMax: bounds.latitudeMax + buffer,
        longitudeMin: bounds.longitudeMin - buffer,
        longitudeMax: bounds.longitudeMax + buffer,
    };
}
