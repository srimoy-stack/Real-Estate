import { InternalListing, InternalListingStatus, ListingLead } from '@repo/types';

export interface ListingQueryParams {
    mlsId?: string;
    ids?: string[];
    city?: string;
    propertyType?: string | string[];
    status?: InternalListingStatus | InternalListingStatus[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    featured?: boolean;
    organizationId?: string;
    keyword?: string;
    limit?: number;
    page?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc';
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
}

export type ListingCardField = Pick<
    InternalListing,
    | 'id'
    | 'mlsNumber'
    | 'address'
    | 'city'
    | 'province'
    | 'price'
    | 'bedrooms'
    | 'bathrooms'
    | 'squareFootage'
    | 'status'
    | 'propertyType'
    | 'images'
    | 'isFeatured'
    | 'createdAt'
    | 'description'
    | 'latitude'
    | 'longitude'
    | 'agentName'
>;

export interface ListingQueryResponse {
    listings: ListingCardField[];
    totalCount: number;
}

// ═══════════════════════════════════════════════════════════
//  DEMO MOCK DATA — Rich listings for demonstration
// ═══════════════════════════════════════════════════════════

const MOCK_LISTINGS: InternalListing[] = [
    {
        id: 'il-001',
        organizationId: 'org-1',
        mlsNumber: 'W1234567',
        address: '123 King Street West, Unit 4501',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 1J2',
        price: 1250000,
        currency: 'CAD',
        status: InternalListingStatus.FOR_SALE,
        propertyType: 'Condo',
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1150,
        lotSize: 0,
        yearBuilt: 2019,
        description: 'Stunning corner unit in the prestigious Bisha Residences with breathtaking panoramic views of the CN Tower and Lake Ontario. This impeccably designed 2-bedroom suite features floor-to-ceiling windows, premium Miele appliances, custom Italian cabinetry, and wide-plank engineered hardwood floors throughout.\n\nThe open-concept living and dining area is bathed in natural light, perfect for entertaining. The primary bedroom offers a generous walk-in closet and a luxurious 5-piece ensuite with rainfall shower and soaker tub. Building amenities include 24/7 concierge, infinity pool, state-of-the-art fitness centre, and exclusive residents\' lounge.\n\nSteps from the Entertainment District, TIFF Bell Lightbox, and the PATH underground network. Transit score: 98.',
        features: ['Floor-to-Ceiling Windows', 'Hardwood Floors', 'Walk-in Closet', 'Open Concept', 'City Views', 'Balcony', 'Smart Home System', 'In-Suite Laundry'],
        amenities: ['24/7 Concierge', 'Infinity Pool', 'Fitness Centre', 'Residents Lounge', 'Rooftop Terrace', 'Party Room', 'Pet Spa', 'Visitor Parking', 'Bicycle Storage', 'EV Charging'],
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
        ],
        virtualTourUrl: 'https://my.matterport.com/show/?m=example',
        latitude: 43.6447,
        longitude: -79.3876,
        agentName: 'John Smith',
        agentPhone: '(416) 555-0201',
        agentEmail: 'john.smith@realty.com',
        brokerageName: 'Skyline Realty Brokerage',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-10T14:30:00Z',
        isFeatured: true,
    },
    {
        id: 'il-002',
        organizationId: 'org-1',
        mlsNumber: 'W7654321',
        address: '456 University Avenue, Suite 2201',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5G 1S5',
        price: 875000,
        currency: 'CAD',
        status: InternalListingStatus.FOR_SALE,
        propertyType: 'Condo',
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 780,
        lotSize: 0,
        yearBuilt: 2021,
        description: 'Sleek and modern 1-bedroom condo in the heart of the Discovery District. This thoughtfully designed unit features high-end finishes, a gourmet kitchen with quartz countertops, and an expansive balcony with unobstructed city views.\n\nPerfectly positioned near U of T, major hospitals, and Queen\'s Park. The building boasts world-class amenities including a rooftop pool, co-working space, and concierge service.',
        features: ['Quartz Countertops', 'Stainless Steel Appliances', 'Balcony', 'City Views', 'In-Suite Laundry', 'Open Concept'],
        amenities: ['Concierge', 'Rooftop Pool', 'Co-Working Space', 'Gym', 'Party Room', 'Guest Suites'],
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
        ],
        latitude: 43.6598,
        longitude: -79.3900,
        agentName: 'Jane Doe',
        agentPhone: '(416) 555-0202',
        agentEmail: 'jane.doe@realty.com',
        brokerageName: 'Skyline Realty Brokerage',
        createdAt: '2026-03-05T08:00:00Z',
        updatedAt: '2026-03-10T14:30:00Z',
        isFeatured: false,
    },
    {
        id: 'il-003',
        organizationId: 'org-1',
        mlsNumber: 'W9876543',
        address: '88 Harbour Street, PH 01',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5J 0B5',
        price: 3450000,
        currency: 'CAD',
        status: InternalListingStatus.FOR_SALE,
        propertyType: 'Condo',
        bedrooms: 3,
        bathrooms: 3,
        squareFootage: 2400,
        lotSize: 0,
        yearBuilt: 2017,
        description: 'Extraordinary penthouse living at Harbour Plaza Residences. This magnificent three-bedroom penthouse spans over 2,400 sq ft with soaring 11-foot ceilings and a wrap-around terrace offering 360-degree views of the Toronto skyline, harbour, and islands.\n\nCustom-designed interiors by a renowned interior architect. Imported Italian marble, motorized window treatments, and a gourmet chef\'s kitchen with Sub-Zero and Wolf appliances. The ultimate in waterfront luxury living.',
        features: ['11-Foot Ceilings', 'Wrap-Around Terrace', 'Italian Marble', 'Motorized Blinds', 'Chef\'s Kitchen', 'Sub-Zero Appliances', 'Custom Millwork', 'Wine Storage'],
        amenities: ['24/7 Concierge', 'Valet Parking', 'Indoor Pool', 'Spa', 'Private Theatre', 'Tennis Court', 'Guest Suites', 'Dog Run'],
        images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
        ],
        latitude: 43.6402,
        longitude: -79.3773,
        agentName: 'John Smith',
        agentPhone: '(416) 555-0201',
        agentEmail: 'john.smith@realty.com',
        brokerageName: 'Skyline Realty Brokerage',
        createdAt: '2026-02-20T12:00:00Z',
        updatedAt: '2026-03-08T09:00:00Z',
        isFeatured: true,
    },
    {
        id: 'il-004',
        organizationId: 'org-1',
        mlsNumber: 'E2345678',
        address: '72 Birchcliff Avenue',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1N 3C4',
        price: 1695000,
        currency: 'CAD',
        status: InternalListingStatus.FOR_SALE,
        propertyType: 'Detached',
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 2650,
        lotSize: 5200,
        yearBuilt: 2008,
        description: 'Beautifully renovated detached home in the Birch Cliff neighbourhood. This sun-filled four-bedroom residence features a professionally landscaped lot, chef\'s kitchen with waterfall island, and a stunning backyard oasis with a heated saltwater pool.\n\nThe open-plan main floor flows seamlessly to a south-facing deck. The finished lower level offers a recreation room, home office, and additional full bathroom. Walking distance to Bluffs trails, shops, and transit.',
        features: ['Heated Salt Pool', 'Chef\'s Kitchen', 'Finished Basement', 'Home Office', 'South-Facing Deck', 'Garage', 'Landscaped Garden', 'Smart Thermostat'],
        amenities: [],
        images: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
        ],
        latitude: 43.6844,
        longitude: -79.2631,
        agentName: 'Jane Doe',
        agentPhone: '(416) 555-0202',
        agentEmail: 'jane.doe@realty.com',
        brokerageName: 'Skyline Realty Brokerage',
        createdAt: '2026-03-08T16:00:00Z',
        updatedAt: '2026-03-10T10:00:00Z',
        isFeatured: true,
    },
    {
        id: 'il-005',
        organizationId: 'org-1',
        mlsNumber: 'V3456789',
        address: '1020 Pacific Boulevard, Unit 3801',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6Z 2B9',
        price: 2100000,
        currency: 'CAD',
        status: InternalListingStatus.FOR_SALE,
        propertyType: 'Condo',
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1380,
        lotSize: 0,
        yearBuilt: 2016,
        description: 'Ultra-luxury living at Yaletown\'s finest address. This pristine corner unit offers dual exposure with mountain and water views that will take your breath away. Premium finishes include engineered hardwood, integrated Gaggenau appliances, and custom built-in shelving.\n\nWorld-class building amenities include a concierge, infinity-edge pool, hot tub, sauna, and private cinema. Unbeatable location in the heart of Yaletown with restaurants, galleries, and the Seawall at your doorstep.',
        features: ['Mountain Views', 'Water Views', 'Corner Unit', 'Gaggenau Appliances', 'Engineered Hardwood', 'Custom Built-Ins', 'Air Conditioning', 'Balcony'],
        amenities: ['Concierge', 'Infinity Pool', 'Hot Tub', 'Sauna', 'Private Cinema', 'Gym', 'Bike Storage', 'EV Charging'],
        images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
        ],
        latitude: 49.2727,
        longitude: -123.1207,
        agentName: 'Michael Chen',
        agentPhone: '(604) 555-0301',
        agentEmail: 'michael.chen@realty.com',
        brokerageName: 'Pacific West Realty',
        createdAt: '2026-03-02T09:00:00Z',
        updatedAt: '2026-03-09T11:00:00Z',
        isFeatured: true,
    },
    {
        id: 'il-006',
        organizationId: 'org-1',
        mlsNumber: 'C4567890',
        address: '215 Elbow Drive SW',
        city: 'Calgary',
        province: 'AB',
        postalCode: 'T2S 2A1',
        price: 985000,
        currency: 'CAD',
        status: InternalListingStatus.SOLD,
        propertyType: 'Detached',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1900,
        lotSize: 4800,
        yearBuilt: 1962,
        description: 'Classic bungalow in the sought-after Elboya neighbourhood, beautifully updated while retaining its mid-century character. Refinished hardwood floors, updated kitchen with shaker cabinetry, and a sun-drenched living room with a wood-burning fireplace.\n\nThe mature tree-lined lot features a detached double garage and private backyard with established gardens. Steps from the Elbow River pathway system and Sandy Beach park.',
        features: ['Wood-Burning Fireplace', 'Hardwood Floors', 'Updated Kitchen', 'Double Garage', 'Mature Lot', 'River Proximity'],
        amenities: [],
        images: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        ],
        latitude: 51.0225,
        longitude: -114.0670,
        agentName: 'Sarah Johnson',
        agentPhone: '(403) 555-0401',
        agentEmail: 'sarah.johnson@realty.com',
        brokerageName: 'Mountain View Properties',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-02-28T15:00:00Z',
        isFeatured: false,
    },
];

// ═══════════════════════════════════════════════════════════
//  LEAD STORE (mock CRM)
// ═══════════════════════════════════════════════════════════
const leadStore: ListingLead[] = [];

export class ListingQueryApi {
    private documentStore: InternalListing[] = [];

    private cache: Map<string, { data: any, expiry: number }> = new Map();
    private pendingQueries: Map<string, Promise<any>> = new Map();
    public cacheDurationMs = 5 * 60 * 1000; // 5 minutes default

    constructor() {
        // Pre-seed with mock data
        this.documentStore = [...MOCK_LISTINGS];
    }

    // Hydrate the store (e.g. from the sync service)
    public seed(listings: InternalListing[]) {
        this.documentStore = listings;
        this.clearCache();
    }

    /**
     * Clear all cached query results.
     * Typically called during MLS sync.
     */
    public clearCache() {
        this.cache.clear();
        this.pendingQueries.clear();
        console.log('[ListingQueryApi] Cache cleared.');
    }

    /**
     * Get full listing by MLS Number
     */
    public async getListingByMlsId(mlsId: string): Promise<InternalListing | null> {
        const cacheKey = `mls_${mlsId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const fetchPromise = (async () => {
            const listing = this.documentStore.find(l => l.mlsNumber === mlsId) || null;
            if (listing) {
                this.cache.set(cacheKey, { data: listing, expiry: Date.now() + this.cacheDurationMs });
            }
            this.pendingQueries.delete(cacheKey);
            return listing;
        })();

        this.pendingQueries.set(cacheKey, fetchPromise);
        return fetchPromise;
    }

    /**
     * Get related listings: same city, similar property type, similar price range.
     * Excludes the current listing.
     */
    public async getRelatedListings(
        listing: InternalListing,
        limit: number = 3
    ): Promise<ListingCardField[]> {
        const priceRange = 0.5; // 50% price range tolerance
        const minPrice = listing.price * (1 - priceRange);
        const maxPrice = listing.price * (1 + priceRange);

        let related = this.documentStore.filter(l => {
            if (l.id === listing.id) return false;
            if (l.status === InternalListingStatus.REMOVED) return false;
            return true;
        });

        // Score each listing for relevance
        const scored = related.map(l => {
            let score = 0;
            if (l.city.toLowerCase() === listing.city.toLowerCase()) score += 3;
            if (l.propertyType === listing.propertyType) score += 2;
            if (l.price >= minPrice && l.price <= maxPrice) score += 1;
            if (l.province === listing.province) score += 0.5;
            return { listing: l, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, limit).map(({ listing: l }) => ({
            id: l.id,
            mlsNumber: l.mlsNumber,
            address: l.address,
            city: l.city,
            province: l.province,
            price: l.price,
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            squareFootage: l.squareFootage,
            status: l.status,
            propertyType: l.propertyType,
            images: l.images && l.images.length > 0 ? [l.images[0]] : [],
            isFeatured: l.isFeatured,
            createdAt: l.createdAt,
            description: l.description,
            latitude: l.latitude,
            longitude: l.longitude,
            agentName: l.agentName,
        }));
    }

    /**
     * Submit a lead/inquiry from a listing page
     */
    public async submitListingLead(data: Omit<ListingLead, 'id' | 'createdAt'>): Promise<ListingLead> {
        const lead: ListingLead = {
            ...data,
            id: `lead_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        leadStore.push(lead);
        console.log('[ListingQueryApi] Lead captured:', lead.id, '→', lead.mlsNumber);
        return lead;
    }

    /**
     * Main Query API Method
     */
    public async searchListings(params: ListingQueryParams): Promise<ListingQueryResponse> {
        const cacheKey = JSON.stringify(params);
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
            return cached.data as ListingQueryResponse;
        }

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const fetchPromise = (async () => {
            // 1. Filtering Phase (Combining multiple filters)
            let results = this.documentStore.filter(listing => {
                if (params.mlsId && listing.mlsNumber !== params.mlsId) return false;

                if (params.ids && params.ids.length > 0) {
                    if (!params.ids.includes(listing.mlsNumber) && !params.ids.includes(listing.id)) {
                        return false;
                    }
                }

                if (params.city && listing.city.toLowerCase() !== params.city.toLowerCase()) return false;

                if (params.organizationId && listing.organizationId !== params.organizationId) return false;

                // Keyword search: match address, city, agentName, or mlsNumber
                if (params.keyword) {
                    const kw = params.keyword.toLowerCase();
                    const matchesKeyword =
                        listing.address.toLowerCase().includes(kw) ||
                        listing.city.toLowerCase().includes(kw) ||
                        listing.agentName.toLowerCase().includes(kw) ||
                        listing.mlsNumber.toLowerCase().includes(kw) ||
                        listing.propertyType.toLowerCase().includes(kw) ||
                        listing.description.toLowerCase().includes(kw);
                    if (!matchesKeyword) return false;
                }

                if (params.propertyType) {
                    const types = Array.isArray(params.propertyType) ? params.propertyType : [params.propertyType];
                    if (!types.includes(listing.propertyType)) return false;
                }

                if (params.status) {
                    const statuses = Array.isArray(params.status) ? params.status : [params.status];
                    if (!statuses.includes(listing.status)) return false;
                }

                if (params.minPrice !== undefined && listing.price < params.minPrice) return false;
                if (params.maxPrice !== undefined && listing.price > params.maxPrice) return false;
                if (params.bedrooms !== undefined && listing.bedrooms < params.bedrooms) return false;
                if (params.bathrooms !== undefined && listing.bathrooms < params.bathrooms) return false;
                if (params.featured !== undefined && listing.isFeatured !== params.featured) return false;

                // Map boundary search filters
                if (params.minLat !== undefined && (!listing.latitude || listing.latitude < params.minLat)) return false;
                if (params.maxLat !== undefined && (!listing.latitude || listing.latitude > params.maxLat)) return false;
                if (params.minLng !== undefined && (!listing.longitude || listing.longitude < params.minLng)) return false;
                if (params.maxLng !== undefined && (!listing.longitude || listing.longitude > params.maxLng)) return false;

                return true;
            });

            // Capture total count before pagination
            const totalCount = results.length;

            // 2. Sorting Phase (Requirement 2: Default sorting by latest)
            const sortParams = params.sort || 'latest';
            results.sort((a, b) => {
                switch (sortParams) {
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'latest':
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });

            // 3. Pagination Phase
            const limit = params.limit || 10;
            const page = params.page || 1;
            const startIndex = (page - 1) * limit;
            const paginatedResults = results.slice(startIndex, startIndex + limit);

            // 4 & 5. Field Selection Phase (Only return required fields for listing cards)
            const mappedListings: ListingCardField[] = paginatedResults.map(listing => ({
                id: listing.id,
                mlsNumber: listing.mlsNumber,
                address: listing.address,
                city: listing.city,
                province: listing.province,
                price: listing.price,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                squareFootage: listing.squareFootage,
                status: listing.status,
                propertyType: listing.propertyType,
                images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
                isFeatured: listing.isFeatured,
                createdAt: listing.createdAt,
                description: listing.description,
                latitude: listing.latitude,
                longitude: listing.longitude,
                agentName: listing.agentName,
            }));

            // 6. Response Format
            const response: ListingQueryResponse = {
                listings: mappedListings,
                totalCount
            };

            this.cache.set(cacheKey, { data: response, expiry: Date.now() + this.cacheDurationMs });
            this.pendingQueries.delete(cacheKey);

            return response;
        })();

        this.pendingQueries.set(cacheKey, fetchPromise);
        return fetchPromise;
    }
}

export const listingQueryApi = new ListingQueryApi();
