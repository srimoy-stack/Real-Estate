/**
 * Mock MLS Feed – simulates a CREA DDF / RESO Web API response.
 * Returns categorized listings: new, updated, removed.
 * Replace fetchMLSListings() with a real HTTP call when the API is ready.
 */

import { MLSListing } from './listingModel';

// ─── STATIC PHOTO BANKS ───────────────────────────────────────────────────
const CONDO_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
];
const HOUSE_IMAGES = [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200',
];
const LUXURY_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1449156001437-3a16d1dfda70?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200',
];

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

// ─── 45 MOCK MLS LISTINGS ─────────────────────────────────────────────────
export const MOCK_MLS_FEED: MLSListing[] = [
    // ── Toronto – Condos ──
    {
        mlsNumber: 'W1234567', price: 1250000, status: 'For Sale', propertyType: 'Condo',
        address: '123 King Street West, Unit 4501', city: 'Toronto', province: 'ON', postalCode: 'M5V 1J2',
        bedrooms: 2, bathrooms: 2, squareFootage: 1150, yearBuilt: 2019,
        description: 'Stunning corner unit at Bisha Residences with panoramic CN Tower & lake views. Floor-to-ceiling windows, Miele appliances, Italian cabinetry.',
        images: LUXURY_IMAGES, features: ['Floor-to-Ceiling Windows', 'Walk-in Closet', 'Smart Home', 'Balcony'],
        amenities: ['24/7 Concierge', 'Infinity Pool', 'Fitness Centre', 'Rooftop Terrace'],
        location: { lat: 43.6447, lng: -79.3876 }, agentName: 'John Smith', agentPhone: '(416) 555-0201',
        agentEmail: 'john@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(5), updatedAt: daysAgo(1),
    },
    {
        mlsNumber: 'W7654321', price: 875000, status: 'For Sale', propertyType: 'Condo',
        address: '456 University Avenue, Suite 2201', city: 'Toronto', province: 'ON', postalCode: 'M5G 1S5',
        bedrooms: 1, bathrooms: 1, squareFootage: 780, yearBuilt: 2021,
        description: 'Sleek 1-bed Discovery District condo. Quartz countertops, balcony with city views, world-class amenities. Near U of T and Queen\'s Park.',
        images: CONDO_IMAGES, features: ['Quartz Countertops', 'Balcony', 'In-Suite Laundry'],
        amenities: ['Concierge', 'Rooftop Pool', 'Co-Working Space', 'Gym'],
        location: { lat: 43.6598, lng: -79.3900 }, agentName: 'Jane Doe', agentPhone: '(416) 555-0202',
        agentEmail: 'jane@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(12), updatedAt: daysAgo(3),
    },
    {
        mlsNumber: 'W9876543', price: 3450000, status: 'For Sale', propertyType: 'Condo',
        address: '88 Harbour Street, PH 01', city: 'Toronto', province: 'ON', postalCode: 'M5J 0B5',
        bedrooms: 3, bathrooms: 3, squareFootage: 2400, yearBuilt: 2017,
        description: 'Extraordinary penthouse at Harbour Plaza with 360° views. 11-ft ceilings, wrap-around terrace, Sub-Zero/Wolf appliances, Italian marble throughout.',
        images: LUXURY_IMAGES, features: ['11-Ft Ceilings', 'Wrap-Around Terrace', 'Italian Marble', 'Chef\'s Kitchen'],
        amenities: ['24/7 Concierge', 'Valet Parking', 'Spa', 'Private Theatre', 'Indoor Pool'],
        location: { lat: 43.6402, lng: -79.3773 }, agentName: 'John Smith', agentPhone: '(416) 555-0201',
        agentEmail: 'john@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(18), updatedAt: daysAgo(5),
    },
    {
        mlsNumber: 'W1122334', price: 659000, status: 'For Sale', propertyType: 'Condo',
        address: '10 Yonge Street, Unit 1802', city: 'Toronto', province: 'ON', postalCode: 'M5E 1R4',
        bedrooms: 1, bathrooms: 1, squareFootage: 620, yearBuilt: 2018,
        description: 'Bright studio+den with south exposure and partial lake views. Modern kitchen, ensuite laundry. Steps from Union Station.',
        images: CONDO_IMAGES, features: ['South Exposure', 'Ensuite Laundry', 'Floor-to-Ceiling Windows'],
        amenities: ['Gym', 'Party Room', 'Visitor Parking'],
        location: { lat: 43.6445, lng: -79.3770 }, agentName: 'Maria Lopez', agentPhone: '(416) 555-0303',
        agentEmail: 'maria@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(8), updatedAt: daysAgo(2),
    },
    {
        mlsNumber: 'W5544332', price: 1890000, status: 'For Sale', propertyType: 'Condo',
        address: '55 Mercer Street, Unit 3302', city: 'Toronto', province: 'ON', postalCode: 'M5V 3L8',
        bedrooms: 2, bathrooms: 2, squareFootage: 1320, yearBuilt: 2022,
        description: 'New luxury suite in the Entertainment District. Custom millwork, Bosch appliances, oversized terrace with city skyline views.',
        images: LUXURY_IMAGES, features: ['Custom Millwork', 'Oversized Terrace', 'Bosch Appliances'],
        amenities: ['Concierge', 'Pool', 'Sauna', 'Yoga Studio', 'EV Charging'],
        location: { lat: 43.6450, lng: -79.3955 }, agentName: 'David Park', agentPhone: '(416) 555-0404',
        agentEmail: 'david@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(3), updatedAt: daysAgo(1),
    },
    // ── Toronto – Houses ──
    {
        mlsNumber: 'E2345678', price: 1695000, status: 'For Sale', propertyType: 'Detached',
        address: '72 Birchcliff Avenue', city: 'Toronto', province: 'ON', postalCode: 'M1N 3C4',
        bedrooms: 4, bathrooms: 3, squareFootage: 2650, lotSize: 5200, yearBuilt: 2008,
        description: 'Renovated Birch Cliff detached with heated saltwater pool, chef\'s kitchen, finished basement, and south-facing deck. Walking distance to Bluffs trails.',
        images: HOUSE_IMAGES, features: ['Heated Salt Pool', 'Chef\'s Kitchen', 'Finished Basement', 'Home Office'],
        amenities: ['Garage', 'Landscaped Garden', 'Smart Thermostat'],
        location: { lat: 43.6844, lng: -79.2631 }, agentName: 'Jane Doe', agentPhone: '(416) 555-0202',
        agentEmail: 'jane@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(10), updatedAt: daysAgo(2),
    },
    {
        mlsNumber: 'E3456789', price: 2150000, status: 'For Sale', propertyType: 'Detached',
        address: '18 Dawes Road', city: 'Toronto', province: 'ON', postalCode: 'M4C 5A5',
        bedrooms: 5, bathrooms: 4, squareFootage: 3200, lotSize: 6400, yearBuilt: 2015,
        description: 'Grand family home in the East End with exceptional craftsmanship. Chefs kitchen with butler\'s pantry, primary retreat with spa bath, and landscaped garden oasis.',
        images: HOUSE_IMAGES, features: ['Butler\'s Pantry', 'Spa Bath', 'Garden Oasis', 'Home Theatre'],
        amenities: ['Double Garage', 'Wine Cellar', 'Irrigation System'],
        location: { lat: 43.6910, lng: -79.2861 }, agentName: 'Sarah Mitchell', agentPhone: '(416) 555-0505',
        agentEmail: 'sarah@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(21), updatedAt: daysAgo(7),
    },
    {
        mlsNumber: 'C8765432', price: 3200000, status: 'For Sale', propertyType: 'Detached',
        address: '44 Forest Hill Road', city: 'Toronto', province: 'ON', postalCode: 'M4V 2P2',
        bedrooms: 6, bathrooms: 5, squareFootage: 5100, lotSize: 8800, yearBuilt: 1998,
        description: 'Prestigious Forest Hill estate on a private ravine lot. Formal living and dining rooms, panelled library, professional kitchen, and an outdoor entertaining pavilion.',
        images: LUXURY_IMAGES, features: ['Ravine Lot', 'Panelled Library', 'Outdoor Pavilion', 'Nanny Suite'],
        amenities: ['Heated Driveway', 'Wine Room', 'Home Gym', 'Cinema'],
        location: { lat: 43.6940, lng: -79.4170 }, agentName: 'James Porter', agentPhone: '(416) 555-0606',
        agentEmail: 'james@realty.com', brokerageName: 'Crown Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(30), updatedAt: daysAgo(10),
    },
    // ── Toronto – Townhouses ──
    {
        mlsNumber: 'W2233445', price: 1099000, status: 'For Sale', propertyType: 'Townhouse',
        address: '89 Portland Street', city: 'Toronto', province: 'ON', postalCode: 'M5V 2N5',
        bedrooms: 3, bathrooms: 2.5, squareFootage: 1900, yearBuilt: 2020,
        description: 'Contemporary freehold townhouse in King West. Rooftop terrace, open-concept main floor, built-in garage. Steps to restaurants and transit.',
        images: HOUSE_IMAGES, features: ['Rooftop Terrace', 'Open Concept', 'Built-in Garage'],
        amenities: ['BBQ Area', 'Smart Lock'],
        location: { lat: 43.6453, lng: -79.4017 }, agentName: 'Priya Sharma', agentPhone: '(416) 555-0707',
        agentEmail: 'priya@realty.com', brokerageName: 'West End Homes', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(6), updatedAt: daysAgo(2),
    },
    // ── Mississauga ──
    {
        mlsNumber: 'X333444', price: 920000, status: 'For Sale', propertyType: 'Townhouse',
        address: '789 Maple Drive', city: 'Mississauga', province: 'ON', postalCode: 'L5B 1X1',
        bedrooms: 3, bathrooms: 2.5, squareFootage: 1800, yearBuilt: 2021,
        description: 'Modern townhouse with rooftop terrace and city views. Open-concept layout with 10-ft ceilings and premium finishes. New construction.',
        images: HOUSE_IMAGES, features: ['Rooftop Terrace', '10-Ft Ceilings', 'New Construction'],
        amenities: ['Central Air', 'Electric Car Charger'],
        location: { lat: 43.5890, lng: -79.6441 }, agentName: 'Sarah Mitchell', agentPhone: '(416) 555-0123',
        agentEmail: 'sarah.m@modernrealty.ca', brokerageName: 'Modern Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(15), updatedAt: daysAgo(4),
    },
    {
        mlsNumber: 'X444555', price: 1350000, status: 'For Sale', propertyType: 'Detached',
        address: '22 Lakeshore Boulevard', city: 'Mississauga', province: 'ON', postalCode: 'L5G 1E6',
        bedrooms: 4, bathrooms: 3, squareFootage: 2400, lotSize: 5800, yearBuilt: 2012,
        description: 'Lakefront community detached home. Bright open-plan kitchen overlooks a private backyard with a stone patio. Close to Port Credit Marina.',
        images: HOUSE_IMAGES, features: ['Stone Patio', 'Bright Kitchen', 'Hardwood Floors', 'Gas Fireplace'],
        amenities: ['Double Garage', 'Central Air'],
        location: { lat: 43.5553, lng: -79.5883 }, agentName: 'Mike Torres', agentPhone: '(905) 555-0808',
        agentEmail: 'mike@realty.com', brokerageName: 'Lakeside Homes', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(25), updatedAt: daysAgo(9),
    },
    // ── Oakville ──
    {
        mlsNumber: 'W6677889', price: 2450000, status: 'For Sale', propertyType: 'Detached',
        address: '5 Bronte Village Lane', city: 'Oakville', province: 'ON', postalCode: 'L6J 1A1',
        bedrooms: 5, bathrooms: 4, squareFootage: 4200, lotSize: 9500, yearBuilt: 2010,
        description: 'Executive Oakville estate steps from the harbour. Custom built with soaring great room, gourmet kitchen, finished lower level with cinema and bar.',
        images: LUXURY_IMAGES, features: ['Great Room', 'Gourmet Kitchen', 'Cinema', 'Wet Bar'],
        amenities: ['3-Car Garage', 'Pool', 'Hot Tub', 'Irrigation System'],
        location: { lat: 43.4668, lng: -79.6938 }, agentName: 'Angela White', agentPhone: '(905) 555-1001',
        agentEmail: 'angela@realty.com', brokerageName: 'Harbour Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(40), updatedAt: daysAgo(12),
    },
    // ── Vancouver ──
    {
        mlsNumber: 'V3456789', price: 2100000, status: 'For Sale', propertyType: 'Condo',
        address: '1020 Pacific Blvd, Unit 3801', city: 'Vancouver', province: 'BC', postalCode: 'V6Z 2B9',
        bedrooms: 2, bathrooms: 2, squareFootage: 1380, yearBuilt: 2016,
        description: 'Ultra-luxury Yaletown corner unit with mountain and water views. Gaggenau appliances, engineered hardwood, infinity-edge pool building.',
        images: LUXURY_IMAGES, features: ['Mountain Views', 'Water Views', 'Corner Unit', 'Air Conditioning'],
        amenities: ['Concierge', 'Infinity Pool', 'Sauna', 'Private Cinema'],
        location: { lat: 49.2727, lng: -123.1207 }, agentName: 'Michael Chen', agentPhone: '(604) 555-0301',
        agentEmail: 'michael@realty.com', brokerageName: 'Pacific West Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(9), updatedAt: daysAgo(3),
    },
    {
        mlsNumber: 'V4567890', price: 1450000, status: 'For Sale', propertyType: 'Condo',
        address: '888 Mainland Street, Unit 2005', city: 'Vancouver', province: 'BC', postalCode: 'V6B 1A2',
        bedrooms: 2, bathrooms: 2, squareFootage: 1050, yearBuilt: 2018,
        description: 'Bright Yaletown 2-bed with Seawall access. Premium finishes, gas range, wraparound balcony. Walk to shops, dining, and False Creek ferry.',
        images: CONDO_IMAGES, features: ['Wraparound Balcony', 'Gas Range', 'Seawall Access'],
        amenities: ['Concierge', 'Gym', 'Party Room'],
        location: { lat: 49.2741, lng: -123.1234 }, agentName: 'Lisa Wang', agentPhone: '(604) 555-0302',
        agentEmail: 'lisa@realty.com', brokerageName: 'Pacific West Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(22), updatedAt: daysAgo(8),
    },
    {
        mlsNumber: 'V5678901', price: 3950000, status: 'For Sale', propertyType: 'Detached',
        address: '2890 Point Grey Road', city: 'Vancouver', province: 'BC', postalCode: 'V6K 1A5',
        bedrooms: 4, bathrooms: 4, squareFootage: 4800, lotSize: 6600, yearBuilt: 2005,
        description: 'Iconic oceanfront property on prestigious Point Grey Road. Unobstructed ocean and mountain views, private garden with direct beach access.',
        images: LUXURY_IMAGES, features: ['Oceanfront', 'Beach Access', 'Mountain Views', 'Private Garden'],
        amenities: ['Triple Garage', 'Home Gym', 'Wine Cellar'],
        location: { lat: 49.2778, lng: -123.1895 }, agentName: 'David Kim', agentPhone: '(604) 555-0303',
        agentEmail: 'david.k@realty.com', brokerageName: 'Pacific West Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(35), updatedAt: daysAgo(14),
    },
    {
        mlsNumber: 'V2234567', price: 1250000, status: 'For Sale', propertyType: 'Townhouse',
        address: '12 Olympic Village Square', city: 'Vancouver', province: 'BC', postalCode: 'V5Y 0C4',
        bedrooms: 3, bathrooms: 2.5, squareFootage: 1620, yearBuilt: 2011,
        description: 'Olympic Village freehold townhouse with private rooftop patio. Sustainable building with LEED certification. Steps from the Seawall.',
        images: HOUSE_IMAGES, features: ['Rooftop Patio', 'LEED Certified', 'Induction Cooktop'],
        amenities: ['EV Charging', 'Bike Storage', 'Community Garden'],
        location: { lat: 49.2724, lng: -123.1085 }, agentName: 'Michael Chen', agentPhone: '(604) 555-0301',
        agentEmail: 'michael@realty.com', brokerageName: 'Pacific West Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(50), updatedAt: daysAgo(20),
    },
    // ── Calgary ──
    {
        mlsNumber: 'C4567890', price: 985000, status: 'Sold', propertyType: 'Detached',
        address: '215 Elbow Drive SW', city: 'Calgary', province: 'AB', postalCode: 'T2S 2A1',
        bedrooms: 3, bathrooms: 2, squareFootage: 1900, lotSize: 4800, yearBuilt: 1962,
        description: 'Classic Elboya bungalow with mid-century character. Updated kitchen, hardwood floors, wood-burning fireplace, double garage on a tree-lined lot.',
        images: HOUSE_IMAGES, features: ['Wood-Burning Fireplace', 'Hardwood Floors', 'Double Garage'],
        amenities: ['Mature Lot', 'River Proximity'],
        location: { lat: 51.0225, lng: -114.0670 }, agentName: 'Sarah Johnson', agentPhone: '(403) 555-0401',
        agentEmail: 'sarah.j@realty.com', brokerageName: 'Mountain View Properties', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(90), updatedAt: daysAgo(30),
    },
    {
        mlsNumber: 'C5678901', price: 750000, status: 'For Sale', propertyType: 'Detached',
        address: '44 Hillcrest Avenue SW', city: 'Calgary', province: 'AB', postalCode: 'T2T 0Z2',
        bedrooms: 3, bathrooms: 2, squareFootage: 1650, lotSize: 3900, yearBuilt: 1978,
        description: 'Charming Scarboro detached ready for your renovation vision. South backyard, oversized lot, and excellent curb appeal in a top school district.',
        images: HOUSE_IMAGES, features: ['South Backyard', 'Oversized Lot', 'Great Schools'],
        amenities: ['Single Garage', 'Shed'],
        location: { lat: 51.0337, lng: -114.0905 }, agentName: 'Tom Bradley', agentPhone: '(403) 555-0402',
        agentEmail: 'tom@realty.com', brokerageName: 'Mountain View Properties', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(14), updatedAt: daysAgo(5),
    },
    {
        mlsNumber: 'C6789012', price: 540000, status: 'For Sale', propertyType: 'Condo',
        address: '530 12th Avenue SW, Unit 1902', city: 'Calgary', province: 'AB', postalCode: 'T2R 0X2',
        bedrooms: 2, bathrooms: 2, squareFootage: 1100, yearBuilt: 2014,
        description: 'Corner unit high-rise in Beltline with floor-to-ceiling windows and city views. Heated underground parking, storage locker, concierge.',
        images: CONDO_IMAGES, features: ['Corner Unit', 'City Views', 'Floor-to-Ceiling Windows'],
        amenities: ['Concierge', 'Gym', 'Guest Suite', 'Heated Parking'],
        location: { lat: 51.0430, lng: -114.0792 }, agentName: 'Nadia Ross', agentPhone: '(403) 555-0403',
        agentEmail: 'nadia@realty.com', brokerageName: 'Downtown Living YYC', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(28), updatedAt: daysAgo(11),
    },
    // ── Ottawa ──
    {
        mlsNumber: 'X123456', price: 850000, status: 'For Sale', propertyType: 'Semi-Detached',
        address: '231 Daly Avenue', city: 'Ottawa', province: 'ON', postalCode: 'K1N 6G2',
        bedrooms: 4, bathrooms: 3, squareFootage: 2200, lotSize: 3600, yearBuilt: 1990,
        description: 'Beautiful Sandy Hill semi-detached with character finishes, bright principal rooms, and a private rear deck. Steps from Rideau Centre and the University of Ottawa.',
        images: HOUSE_IMAGES, features: ['Character Finishes', 'Rear Deck', 'Bright Rooms'],
        amenities: ['Parking', 'Storage'],
        location: { lat: 45.4228, lng: -75.6827 }, agentName: 'Emily Grant', agentPhone: '(613) 555-0501',
        agentEmail: 'emily@realty.com', brokerageName: 'Capital Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(17), updatedAt: daysAgo(6),
    },
    {
        mlsNumber: 'X654321', price: 1850000, status: 'For Sale', propertyType: 'Detached',
        address: '456 Oak Avenue', city: 'Vancouver', province: 'BC', postalCode: 'V6B 1A1',
        bedrooms: 4, bathrooms: 3, squareFootage: 2800, lotSize: 6000, yearBuilt: 2008,
        description: 'Large family home in a quiet neighbourhood with landscaped backyard, large deck, and finished basement with separate entrance.',
        images: HOUSE_IMAGES, features: ['Landscaped Backyard', 'Large Deck', 'Finished Basement'],
        amenities: ['Double Garage', 'Gas Heating', 'Security System'],
        location: { lat: 49.2827, lng: -123.1207 }, agentName: 'Marcus Chen', agentPhone: '(604) 555-0987',
        agentEmail: 'm.chen@modernrealty.ca', brokerageName: 'Modern Realty Vancouver', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(45), updatedAt: daysAgo(15),
    },
    // ── Montreal ──
    {
        mlsNumber: 'Q1234567', price: 975000, status: 'For Sale', propertyType: 'Condo',
        address: '1000 De La Gauchetière West, Unit 3601', city: 'Montreal', province: 'QC', postalCode: 'H3B 4W5',
        bedrooms: 2, bathrooms: 2, squareFootage: 1280, yearBuilt: 2020,
        description: 'Luxury condo at Montréal\'s most prestigious downtown address. Panoramic city views, concierge, and state-of-the-art amenities.',
        images: LUXURY_IMAGES, features: ['Panoramic City Views', 'Open Concept', 'Ensuite Laundry'],
        amenities: ['Concierge', 'Pool', 'Gym', 'Spa'],
        location: { lat: 45.4994, lng: -73.5681 }, agentName: 'Sophie Beaumont', agentPhone: '(514) 555-0601',
        agentEmail: 'sophie@realty.com', brokerageName: 'Royal Montréal Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(7), updatedAt: daysAgo(2),
    },
    {
        mlsNumber: 'Q2345678', price: 640000, status: 'For Sale', propertyType: 'Semi-Detached',
        address: '3870 Rue Clark', city: 'Montreal', province: 'QC', postalCode: 'H2W 1W5',
        bedrooms: 3, bathrooms: 1.5, squareFootage: 1700, lotSize: 2800, yearBuilt: 1935,
        description: 'Charming Plateau semi-detached triplex with original character details, exposed brick, and a spiral staircase to private balcony. Great investment property.',
        images: HOUSE_IMAGES, features: ['Exposed Brick', 'Spiral Staircase', 'Private Balcony', 'Character Details'],
        amenities: ['3 Units', 'Rear Laneway Parking'],
        location: { lat: 45.5217, lng: -73.5816 }, agentName: 'Luc Tremblay', agentPhone: '(514) 555-0602',
        agentEmail: 'luc@realty.com', brokerageName: 'Plateau Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(33), updatedAt: daysAgo(12),
    },
    // ── Muskoka / Cottage Country ──
    {
        mlsNumber: 'X777888', price: 1250000, status: 'For Sale', propertyType: 'Detached',
        address: '101 Pine Ridge Road', city: 'Muskoka', province: 'ON', postalCode: 'P1H 2K2',
        bedrooms: 4, bathrooms: 3, squareFootage: 2200, lotSize: 15000, yearBuilt: 2009,
        description: 'Year-round Muskoka waterfront cottage on 150-ft of pristine lakefront. Open great room with stone fireplace, wrap-around dock, and boathouse.',
        images: LUXURY_IMAGES, features: ['Lakefront', 'Stonefireplace', 'Wrap-Around Dock', 'Boathouse'],
        amenities: ['Waterfront Access', 'Fire Pit', 'Guest Cabin'],
        location: { lat: 45.1234, lng: -79.1234 }, agentName: 'Jessica Reynolds', agentPhone: '(705) 555-0701',
        agentEmail: 'jessica@realty.com', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(60), updatedAt: daysAgo(20),
    },
    {
        mlsNumber: 'X888999', price: 795000, status: 'For Sale', propertyType: 'Detached',
        address: '55 Bayview Drive', city: 'Barrie', province: 'ON', postalCode: 'L4N 5S4',
        bedrooms: 3, bathrooms: 2, squareFootage: 1750, lotSize: 5500, yearBuilt: 2018,
        description: 'Move-in-ready Barrie detached close to Kempenfelt Bay. Bright kitchen, main floor primary suite, and a private backyard with mature trees.',
        images: HOUSE_IMAGES, features: ['Main Floor Primary', 'Bright Kitchen', 'Mature Trees'],
        amenities: ['Single Garage', 'Central Air'],
        location: { lat: 44.3894, lng: -79.6903 }, agentName: 'Paul Nester', agentPhone: '(705) 555-0702',
        agentEmail: 'paul@realty.com', brokerageName: 'Bay Country Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(11), updatedAt: daysAgo(4),
    },
    // ── Hamilton ──
    {
        mlsNumber: 'H1122334', price: 699000, status: 'For Sale', propertyType: 'Detached',
        address: '82 Aberdeen Avenue', city: 'Hamilton', province: 'ON', postalCode: 'L8P 2P6',
        bedrooms: 4, bathrooms: 2, squareFootage: 2100, lotSize: 4200, yearBuilt: 1925,
        description: 'Gorgeous Durand character home fully updated. Original millwork, updated kitchen, finished lower level. Walk to Locke Street shops.',
        images: HOUSE_IMAGES, features: ['Original Millwork', 'Updated Kitchen', 'Character Home'],
        amenities: ['Single Garage', 'Rear Deck', 'Parkette Views'],
        location: { lat: 43.2551, lng: -79.8712 }, agentName: 'Rachel Kim', agentPhone: '(905) 555-0801',
        agentEmail: 'rachel@realty.com', brokerageName: 'Anchor Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(19), updatedAt: daysAgo(7),
    },
    // ── Brampton ──
    {
        mlsNumber: 'B4455667', price: 1180000, status: 'For Sale', propertyType: 'Detached',
        address: '10 Conestoga Drive', city: 'Brampton', province: 'ON', postalCode: 'L6X 3R5',
        bedrooms: 4, bathrooms: 3.5, squareFootage: 2900, lotSize: 4600, yearBuilt: 2007,
        description: 'Spacious Brampton executive home in Credit Valley with double car garage, granite kitchen, and professionally landscaped yard. Top-rated school catchment.',
        images: HOUSE_IMAGES, features: ['Granite Kitchen', 'Top Schools', 'Landscaped Yard'],
        amenities: ['Double Garage', 'Central Vac', 'Laundry Room'],
        location: { lat: 43.6918, lng: -79.7607 }, agentName: 'Arjun Patel', agentPhone: '(905) 555-0901',
        agentEmail: 'arjun@realty.com', brokerageName: 'GTA Realty Group', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(16), updatedAt: daysAgo(5),
    },
    // ── Vaughan ──
    {
        mlsNumber: 'V9988776', price: 1590000, status: 'For Sale', propertyType: 'Detached',
        address: '5 Islington Avenue', city: 'Vaughan', province: 'ON', postalCode: 'L4L 9A1',
        bedrooms: 5, bathrooms: 4, squareFootage: 3600, lotSize: 5200, yearBuilt: 2016,
        description: 'Stunning Woodbridge executive with 20-ft foyer, coffered ceilings, gourmet kitchen and beautiful in-ground pool. Near Vaughan Mills and Highway 400.',
        images: LUXURY_IMAGES, features: ['20-Ft Foyer', 'Coffered Ceilings', 'In-Ground Pool', 'Gourmet Kitchen'],
        amenities: ['3-Car Garage', 'Smart Home', 'Security System'],
        location: { lat: 43.7867, lng: -79.5296 }, agentName: 'Tony Moretti', agentPhone: '(905) 555-1101',
        agentEmail: 'tony@realty.com', brokerageName: 'Excel Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(23), updatedAt: daysAgo(8),
    },
    // ── Markham ──
    {
        mlsNumber: 'M3344556', price: 1450000, status: 'For Sale', propertyType: 'Detached',
        address: '77 Swan Lane', city: 'Markham', province: 'ON', postalCode: 'L3R 2T1',
        bedrooms: 4, bathrooms: 3, squareFootage: 2800, lotSize: 4800, yearBuilt: 2003,
        description: 'Unionville gem on a premium pie lot. Updated throughout with hardwood floors, modern baths, and an entertainer\'s backyard with armour stone waterfall.',
        images: HOUSE_IMAGES, features: ['Pie-Shaped Lot', 'Armour Stone Waterfall', 'Hardwood Floors'],
        amenities: ['Double Garage', 'Central Air', 'Water Softener'],
        location: { lat: 43.8561, lng: -79.3370 }, agentName: 'Helen Chang', agentPhone: '(905) 555-1201',
        agentEmail: 'helen@realty.com', brokerageName: 'York Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(38), updatedAt: daysAgo(13),
    },
    // ── Richmond Hill ──
    {
        mlsNumber: 'R5566778', price: 2100000, status: 'For Sale', propertyType: 'Detached',
        address: '14 Crosby Avenue', city: 'Richmond Hill', province: 'ON', postalCode: 'L4C 1T9',
        bedrooms: 5, bathrooms: 5, squareFootage: 4100, lotSize: 7800, yearBuilt: 2019,
        description: 'Architectural masterpiece in Oak Ridges with professional kitchen, primary suite with juliet balcony, basement apartment, and heated pool.',
        images: LUXURY_IMAGES, features: ['Juliet Balcony', 'Heated Pool', 'Basement Apartment', 'Pro Kitchen'],
        amenities: ['3-Car Garage', 'Irrigation System', 'Smart Lighting'],
        location: { lat: 43.8828, lng: -79.4448 }, agentName: 'Grace Liu', agentPhone: '(905) 555-1301',
        agentEmail: 'grace@realty.com', brokerageName: 'Heritage Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(4), updatedAt: daysAgo(1),
    },
    // ── Mississauga – Condos ──
    {
        mlsNumber: 'X556677', price: 729000, status: 'For Sale', propertyType: 'Condo',
        address: '70 Absolute Avenue, Unit 2803', city: 'Mississauga', province: 'ON', postalCode: 'L4Z 0A3',
        bedrooms: 2, bathrooms: 2, squareFootage: 1020, yearBuilt: 2010,
        description: 'Light-filled corner suite at iconic Absolute City Centre. Split bedrooms, upgraded kitchen, and a huge wraparound balcony with panoramic views.',
        images: CONDO_IMAGES, features: ['Corner Suite', 'Wraparound Balcony', 'Split Bedrooms'],
        amenities: ['Indoor Pool', 'Gym', 'Tennis Court', 'Party Room'],
        location: { lat: 43.5932, lng: -79.6445 }, agentName: 'Priya Sharma', agentPhone: '(416) 555-0707',
        agentEmail: 'priya@realty.com', brokerageName: 'West End Homes', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(27), updatedAt: daysAgo(10),
    },
    // ── London, ON ──
    {
        mlsNumber: 'L7788990', price: 579000, status: 'For Sale', propertyType: 'Detached',
        address: '99 Wortley Road', city: 'London', province: 'ON', postalCode: 'N6C 3P4',
        bedrooms: 3, bathrooms: 2, squareFootage: 1550, lotSize: 4500, yearBuilt: 1960,
        description: 'Cozy Wortley Village bungalow full of charm. Updated kitchen and baths, private backyard, and within walking distance to all village amenities.',
        images: HOUSE_IMAGES, features: ['Updated Kitchen', 'Private Backyard', 'Village Location'],
        amenities: ['Detached Garage', 'Rear Deck'],
        location: { lat: 42.9817, lng: -81.2556 }, agentName: 'Chris Lawson', agentPhone: '(519) 555-0901',
        agentEmail: 'chris@realty.com', brokerageName: 'Forest City Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(44), updatedAt: daysAgo(16),
    },
    // ── Pending / Sold listings ──
    {
        mlsNumber: 'W0011223', price: 998000, status: 'Pending', propertyType: 'Detached',
        address: '66 Harbord Street', city: 'Toronto', province: 'ON', postalCode: 'M5S 1G1',
        bedrooms: 3, bathrooms: 2, squareFootage: 1850, lotSize: 2500, yearBuilt: 1920,
        description: 'Annex Victorian semi-detached (sold conditional). Character original details, renovated kitchen, and a rear laneway garage. Rare find on a quiet block.',
        images: HOUSE_IMAGES, features: ['Victorian Details', 'Laneway Garage', 'Updated Kitchen'],
        amenities: ['Rear Patio'],
        location: { lat: 43.6614, lng: -79.3997 }, agentName: 'Jane Doe', agentPhone: '(416) 555-0202',
        agentEmail: 'jane@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(60), updatedAt: daysAgo(2),
    },
    {
        mlsNumber: 'V0099887', price: 1100000, status: 'Sold', propertyType: 'Condo',
        address: '535 Smithe Street, Unit 1401', city: 'Vancouver', province: 'BC', postalCode: 'V6B 0H3',
        bedrooms: 2, bathrooms: 2, squareFootage: 970, yearBuilt: 2016,
        description: 'SOLD OVER ASKING. Exceptional downtown Vancouver condo in Yaletown with city views, high-end finishes, and unbeatable location.',
        images: CONDO_IMAGES, features: ['City Views', 'High-End Finishes'],
        amenities: ['Concierge', 'Gym'],
        location: { lat: 49.2751, lng: -123.1213 }, agentName: 'Michael Chen', agentPhone: '(604) 555-0301',
        agentEmail: 'michael@realty.com', brokerageName: 'Pacific West Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(120), updatedAt: daysAgo(25),
    },
    // ── Edmonton ──
    {
        mlsNumber: 'A1234567', price: 570000, status: 'For Sale', propertyType: 'Detached',
        address: '10225 140 Street NW', city: 'Edmonton', province: 'AB', postalCode: 'T5N 2H5',
        bedrooms: 4, bathrooms: 3, squareFootage: 2200, lotSize: 5600, yearBuilt: 1955,
        description: 'Fully renovated Glenora bungalow on a quiet tree-lined street. Open-concept main floor with luxury kitchen, main floor den, and triple-pane windows.',
        images: HOUSE_IMAGES, features: ['Open Concept', 'Luxury Kitchen', 'Triple-Pane Windows'],
        amenities: ['Single Garage', 'Landscaped Yard', 'Central Air'],
        location: { lat: 53.5450, lng: -113.5434 }, agentName: 'Kyle Marsh', agentPhone: '(780) 555-1001',
        agentEmail: 'kyle@realty.com', brokerageName: 'Capital City Homes', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(29), updatedAt: daysAgo(10),
    },
    // ── Victoria, BC ──
    {
        mlsNumber: 'V8877665', price: 1350000, status: 'For Sale', propertyType: 'Detached',
        address: '3300 Ripon Road', city: 'Victoria', province: 'BC', postalCode: 'V8P 4Z9',
        bedrooms: 4, bathrooms: 3, squareFootage: 2500, lotSize: 7200, yearBuilt: 1985,
        description: 'Sweeping ocean views from this Uplands-adjacent home. Updated throughout with a new kitchen, radiant heat floors, and a lush private garden.',
        images: LUXURY_IMAGES, features: ['Ocean Views', 'Radiant Heat Floors', 'Private Garden'],
        amenities: ['Double Garage', 'Greenhouse', 'Garden Workshop'],
        location: { lat: 48.4476, lng: -123.3277 }, agentName: 'Nicole Fraser', agentPhone: '(250) 555-1001',
        agentEmail: 'nicole@realty.com', brokerageName: 'Island Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(13), updatedAt: daysAgo(4),
    },
    // ── Kelowna ──
    {
        mlsNumber: 'K3344556', price: 1050000, status: 'For Sale', propertyType: 'Detached',
        address: '2150 Pandosy Street', city: 'Kelowna', province: 'BC', postalCode: 'V1Y 1T5',
        bedrooms: 4, bathrooms: 3, squareFootage: 2850, lotSize: 6000, yearBuilt: 2014,
        description: 'Stunning Okanagan lifestyle home minutes from the beach and wineries. Vaulted ceilings, custom cabinetry, covered patio with hot tub, and mountain views.',
        images: LUXURY_IMAGES, features: ['Vaulted Ceilings', 'Mountain Views', 'Hot Tub', 'Covered Patio'],
        amenities: ['Double Garage', 'Irrigation', 'Solar Panels'],
        location: { lat: 49.8857, lng: -119.4960 }, agentName: 'Brandon Wiese', agentPhone: '(250) 555-2001',
        agentEmail: 'brandon@realty.com', brokerageName: 'Okanagan Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(24), updatedAt: daysAgo(9),
    },
    // ── Halifax ──
    {
        mlsNumber: 'H5566778', price: 699000, status: 'For Sale', propertyType: 'Detached',
        address: '4 Quinpool Road', city: 'Halifax', province: 'NS', postalCode: 'B3L 1A4',
        bedrooms: 3, bathrooms: 2, squareFootage: 1600, lotSize: 4800, yearBuilt: 1945,
        description: 'Heritage South End home lovingly restored. Original hardwood floors, wainscoting, clawfoot tub, and updated systems. Steps from Point Pleasant Park.',
        images: HOUSE_IMAGES, features: ['Heritage Restored', 'Original Hardwood', 'Wainscoting', 'Clawfoot Tub'],
        amenities: ['Rear Yard', 'Shed'],
        location: { lat: 44.6488, lng: -63.5863 }, agentName: 'Emma MacLellan', agentPhone: '(902) 555-1001',
        agentEmail: 'emma@realty.com', brokerageName: 'East Coast Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(47), updatedAt: daysAgo(18),
    },
    // ── Winnipeg ──
    {
        mlsNumber: 'W3344556', price: 499000, status: 'For Sale', propertyType: 'Detached',
        address: '88 Wellington Crescent', city: 'Winnipeg', province: 'MB', postalCode: 'R3M 0A6',
        bedrooms: 4, bathrooms: 2.5, squareFootage: 2100, lotSize: 5500, yearBuilt: 1952,
        description: 'Classic River Heights home on a prestigious crescent. Updated systems, gracious living and dining rooms, and a newer kitchen with quartz counters.',
        images: HOUSE_IMAGES, features: ['Quartz Counters', 'Gracious Rooms', 'Updated Systems'],
        amenities: ['Single Garage', 'River Views'],
        location: { lat: 49.8691, lng: -97.1887 }, agentName: 'Sam Bergeron', agentPhone: '(204) 555-1001',
        agentEmail: 'sam@realty.com', brokerageName: 'Prairie Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(36), updatedAt: daysAgo(14),
    },
    // ── Additional agent-2 listings ──
    {
        mlsNumber: 'AG2001', price: 1125000, status: 'For Sale', propertyType: 'Detached',
        address: '204 Spadina Avenue', city: 'Toronto', province: 'ON', postalCode: 'M5T 2C2',
        bedrooms: 4, bathrooms: 3, squareFootage: 2300, lotSize: 1800, yearBuilt: 1905,
        description: 'Fully restored Kensington Market Victorian rowhouse with rear garden and coach house studio. Stained glass, original brick, and a chef\'s kitchen.',
        images: HOUSE_IMAGES, features: ['Victorian Heritage', 'Coach House', 'Stained Glass', 'Chef\'s Kitchen'],
        amenities: ['Rear Garden', 'Studio / Office'],
        location: { lat: 43.6543, lng: -79.4003 }, agentName: 'Maria Lopez', agentPhone: '(416) 555-0303',
        agentEmail: 'maria@realty.com', brokerageName: 'Skyline Realty', organizationId: 'org-1',
        isFeatured: false, createdAt: daysAgo(55), updatedAt: daysAgo(22),
    },
    {
        mlsNumber: 'AG2002', price: 2780000, status: 'For Sale', propertyType: 'Detached',
        address: '12 Hazelton Avenue', city: 'Toronto', province: 'ON', postalCode: 'M5R 2E2',
        bedrooms: 5, bathrooms: 5, squareFootage: 4600, lotSize: 4200, yearBuilt: 2022,
        description: 'Brand new Yorkville detached exuding contemporary luxury. Clean lines, glass and steel façade, elevator, rooftop hot tub, and a 2-car private garage.',
        images: LUXURY_IMAGES, features: ['Elevator', 'Rooftop Hot Tub', '2-Car Garage', 'Contemporary Design'],
        amenities: ['Smart Home', 'Wine Room', 'Nanny Suite'],
        location: { lat: 43.6720, lng: -79.3932 }, agentName: 'James Porter', agentPhone: '(416) 555-0606',
        agentEmail: 'james@realty.com', brokerageName: 'Crown Realty', organizationId: 'org-1',
        isFeatured: true, createdAt: daysAgo(2), updatedAt: daysAgo(1),
    },
];

export interface MLSFeedResponse {
    active: MLSListing[];
    updated: MLSListing[];
    removed: string[]; // MLS numbers to mark removed
    timestamp: string;
}

/**
 * Simulate fetching from a live MLS / DDF feed endpoint.
 * When real APIs are ready, replace this function body with:
 *   const res = await fetch('https://ddf.crea.ca/...', { headers: { Authorization: ... } });
 *   return res.json();
 */
export async function fetchMLSListings(): Promise<MLSFeedResponse> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 400));

    const now = new Date().toISOString();
    const allListings = MOCK_MLS_FEED;

    // Split into active and updated (simulate: listings older than 30d that changed price)
    const active = allListings.filter(l => l.status === 'For Sale' || l.status === 'Pending');
    const updated = allListings
        .filter(l => l.status === 'Sold')
        .map(l => ({ ...l, updatedAt: now }));

    // No removals from the feed in this simulation
    const removed: string[] = [];

    return { active, updated, removed, timestamp: now };
}
