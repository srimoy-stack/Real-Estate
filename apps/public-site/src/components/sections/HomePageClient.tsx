'use client';

import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { CommunitiesSection } from '@/components/sections/CommunitiesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';

export const HomePageClient = () => {
    return (
        <>
            <HeroSection />
            <FeaturedListings />
            <PropertyCategories />
            <CommunitiesSection />
            <CTASection />
            <TestimonialsSection />
            <BlogSection />
            <ContactSection />
        </>
    );
};
