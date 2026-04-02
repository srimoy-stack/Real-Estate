// ─── MLS Property Types ─────────────────────────────────────────────────────

export interface MLSMedia {
    MediaKey: string;
    ResourceRecordKey: string;
    LongDescription: string | null;
    MediaURL: string;
    ModificationTimestamp: string;
    Order: number;
    PreferredPhotoYN: boolean;
    ResourceRecordId: string;
    ResourceName: string;
    MediaCategory: string;
}

export interface MLSRoom {
    RoomType: string;
    RoomLevel: string;
    RoomDimensions: string | null;
}

export interface MLSProperty {
    ListingKey: string;
    ListingId: string;
    StandardStatus: string;
    MlsStatus?: string | null;
    ListPrice: number | null;
    LeaseAmount?: number | null;
    UnparsedAddress: string;
    City: string;
    StateOrProvince: string;
    PostalCode: string;
    Country: string;
    PropertyType?: string;
    PropertySubType: string;
    BedroomsTotal: number | null;
    BathroomsTotalInteger: number | null;
    LivingArea: number | null;
    LivingAreaUnits?: string | null;
    PublicRemarks: string;
    Media: MLSMedia[];
    Latitude: number;
    Longitude: number;
    ParkingTotal?: number | null;
    ParkingFeatures?: string[];
    YearBuilt?: number | null;
    Stories?: string | null;
    ListingURL: string;
    ModificationTimestamp: string;
    ListingDate?: string | null;
    CreatedAt?: string | null;
    OriginalEntryTimestamp?: string;
    CommonInterest?: string | null;
    StructureType?: string[];
    Heating?: string[];
    LotSizeArea?: number | null;
    LotSizeUnits?: string | null;
    PropertyAttachedYN?: boolean | null;
    View?: string[];
    AssociationFee?: number | null;
    AssociationFeeFrequency?: string | null;
    TaxAnnualAmount?: number | null;
    TaxYear?: number | null;
    ZoningDescription: string | null;
    SubdivisionName: string | null;
    Rooms: MLSRoom[];
    isFeatured?: boolean;
    // Agent & Office (from api.txt spec)
    ListAgentKey: string | null;
    ListOfficeKey: string | null;
    agentName?: string | null;
    agentPhone?: string | null;
    officeName?: string | null;
    // DDF Compliance fields (injected by compliance layer)
    moreInformationLink?: string | null;
    primaryPhotoUrl?: string | null;
    primaryPhoto?: string | null;
    mediaJson?: any[] | null;
    _ddfCompliant?: boolean;
}

export interface MLSApiResponse {
    listings: MLSProperty[];
    nextLink: string | null;
    total: number;
    totalCount?: number;
}

// ─── Filter State (mirrors Realtor.ca filter panel) ─────────────────────────

export interface FilterState {
    // Hero section
    searchQuery: string;
    listingType: 'Residential' | 'Commercial' | 'Any';

    // Row 1: Transaction / Property Type
    transactionType: string;  // 'For Sale' | 'For Rent'
    propertyType: string;     // PropertySubType enum

    // Row 2: Price / Beds / Baths / Sqft
    minPrice: string;
    maxPrice: string;
    beds: string;
    baths: string;
    minSqft: string;
    maxSqft: string;

    // Row 3: Land / Listed Since / Building Type / Storeys
    minLandSize: string;
    maxLandSize: string;
    listedSince: string;      // ISO date string
    buildingType: string;     // StructureType value
    minStoreys: string;
    maxStoreys: string;

    // Row 4: Ownership / Maintenance / Tax / Year Built
    ownershipType: string;    // CommonInterest: 'Freehold' | 'Condo/Strata'
    minMaintFee: string;
    maxMaintFee: string;
    minTax: string;
    maxTax: string;
    minYearBuilt: string;
    maxYearBuilt: string;

    // Row 5: Keywords
    keywords: string;

    city: string;
    featured: boolean;
    sortBy: string;
    order: 'asc' | 'desc';
    // Geo Bounds
    latitudeMin?: number;
    latitudeMax?: number;
    longitudeMin?: number;
    longitudeMax?: number;
}

export const DEFAULT_FILTERS: FilterState = {
    searchQuery: '',
    listingType: 'Any',
    transactionType: 'For Sale',
    propertyType: 'Any',
    minPrice: '',
    maxPrice: '',
    beds: 'Any',
    baths: 'Any',
    minSqft: '',
    maxSqft: '',
    minLandSize: '',
    maxLandSize: '',
    listedSince: '',
    buildingType: 'Any',
    minStoreys: '',
    maxStoreys: '',
    ownershipType: 'Any',
    minMaintFee: '',
    maxMaintFee: '',
    minTax: '',
    maxTax: '',
    minYearBuilt: '',
    maxYearBuilt: '',
    keywords: '',
    city: '',
    featured: false,
    sortBy: 'newest',
    order: 'desc',
};

// ─── Constants (all verified against live CREA DDF OData API) ───────────────

export const TRANSACTION_TYPES = ['For Sale', 'For Rent'];

// Verified PropertySubType enum values
export const PROPERTY_TYPES = [
    'Any',
    'Residential',
    'Commercial',
    'Condo',
    'Lease'
];

// Verified StructureType values
export const BUILDING_TYPES = [
    'Any',
    'House',
    'Two Apartment House',
    'Offices',
    'No Building',
    'Other',
];

// Verified CommonInterest values
export const OWNERSHIP_TYPES = [
    'Any',
    'Freehold',
    'Condo/Strata',
];

export const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+', '5+'];
export const BATH_OPTIONS = ['Any', '1+', '2+', '3+', '4+'];

export const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Price (High to Low)', value: 'price_desc' },
    { label: 'Bedrooms', value: 'beds' },
    { label: 'Square Footage', value: 'sqft' },
    { label: 'Built Year', value: 'year' },
];

export const PRICE_RANGES = {
    min: ['', '50000', '100000', '200000', '300000', '500000', '750000', '1000000'],
    max: ['', '200000', '300000', '500000', '750000', '1000000', '1500000', '2000000', '5000000'],
};

export const SQFT_RANGES = {
    min: ['', '500', '750', '1000', '1500', '2000', '3000'],
    max: ['', '1000', '1500', '2000', '3000', '4000', '5000', '10000'],
};

export const LAND_SIZE_RANGES = {
    min: ['', '1000', '2000', '5000', '10000', '50000'],
    max: ['', '5000', '10000', '50000', '100000', '500000'],
};

export const STOREY_RANGES = {
    min: ['', '1', '2', '3'],
    max: ['', '2', '3', '5', '10', '20'],
};

export const MAINT_FEE_RANGES = {
    min: ['', '100', '200', '300', '500'],
    max: ['', '300', '500', '750', '1000', '2000'],
};

export const TAX_RANGES = {
    min: ['', '1000', '2000', '3000', '5000'],
    max: ['', '3000', '5000', '7500', '10000', '20000'],
};

export const YEAR_BUILT_RANGES = {
    min: ['', '1950', '1970', '1990', '2000', '2010', '2020'],
    max: ['', '1990', '2000', '2010', '2020', '2025', '2026'],
};

export const CANADIAN_CITIES = [
    'Toronto',
    'Vancouver',
    'Montreal',
    'Calgary',
    'Ottawa',
    'Edmonton',
    'Mississauga',
    'Winnipeg',
    'Hamilton',
    'Brampton',
    'Surrey',
    'Halifax',
    'London',
    'Windsor',
    'Markham',
    'Kitchener',
    'St. Catharines',
    'Niagara Falls',
    'Victoria',
    'Oshawa',
];
