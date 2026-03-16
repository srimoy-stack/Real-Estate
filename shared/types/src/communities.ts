import { BaseEntity } from './index';

export interface Community extends BaseEntity {
    slug: string;
    name: string;
    description: string;
    image: string;
    listingCount: number;
    avgPrice: number;
    amenities: string[];
}
