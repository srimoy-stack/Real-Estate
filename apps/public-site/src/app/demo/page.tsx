import { Header } from '@/components/sections/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { CommunitiesSection } from '@/components/sections/CommunitiesSection';
import { CTASection } from '@/components/sections/CTASection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/sections/Footer';

export default function HomeLayout() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <HeroSection />
                <FeaturedListings />
                <PropertyCategories />
                <CommunitiesSection />
                <CTASection />
                <BlogSection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}
