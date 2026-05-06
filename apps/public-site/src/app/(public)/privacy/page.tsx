import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Transparent Real Estate Data Practices',
    description: 'Learn how we protect your personal information and maintain transparency in the real estate industry.',
};

export default function PrivacyPage() {
    const sections = [
        {
            id: 'collection',
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create an account, search for properties, or communicate with agents. This may include your name, email, phone number, and physical address.'
        },
        {
            id: 'usage',
            title: '2. How We Use Your Data',
            content: 'We use the collected data to personalize your home search, facilitate communication with licensed agents, improve our website performance, and send you relevant market updates.'
        },
        {
            id: 'sharing',
            title: '3. Data Sharing and Disclosure',
            content: 'We share your request details with our partner agents and brokerages only when you explicitly ask to view a home or request more information about a listing.'
        },
        {
            id: 'security',
            title: '4. Security Measures',
            content: 'Your security is a top priority. We use industry-standard encryption and security protocols to project your data from unauthorized access or disclosure.'
        },
        {
            id: 'contact',
            title: '5. Exercising Your Rights',
            content: 'You may request to access, correct, or delete your personal data at any time by contacting us at privacy@squareft.ca.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Top Accent Strip */}
            <div className="w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />

            <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    <header className="space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Privacy <span className="text-emerald-600 italic">Policy.</span>
                        </h1>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Last Updated: March 2024</p>
                    </header>

                    <div className="space-y-16 py-12 border-t border-gray-100">
                        {sections.map((section) => (
                            <div key={section.id} className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                                <div className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="pt-12 border-t border-gray-100 italic font-bold text-gray-400 text-sm">
                        Questions? Contact our Data Privacy Officer at privacy@squareft.ca
                    </footer>
                </div>
            </main>
        </div>
    );
}
