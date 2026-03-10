'use client';

import React from 'react';
import { AgentHero } from './agent-hero';
import { AgentBio } from './agent-bio';
import { FeaturedListings } from './FeaturedListings';
import { CommunitiesSection } from './communities-section';
import { Testimonials } from './testimonials';
import { ContactSection } from './contact-section';

export const Homepage: React.FC = () => (
    <>
        <AgentHero />
        <AgentBio />
        <FeaturedListings />
        <CommunitiesSection />
        <Testimonials />
        <ContactSection />
    </>
);
