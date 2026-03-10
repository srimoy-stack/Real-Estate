import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Real Estate Platform Usage Rules',
    description: 'Learn about the terms and conditions for using our real estate services and property search tools.',
};

export default function TermsPage() {
    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: 'By accessing or using our real estate platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.'
        },
        {
            id: 'usage',
            title: '2. Usage and Accounts',
            content: 'You are responsible for all activities occurring under your account. You must provide accurate and complete information and maintain the security of your account credentials.'
        },
        {
            id: 'listings',
            title: '3. Real Estate Listings',
            content: 'Property data is provided for information purposes only. While we strive for accuracy, we cannot guarantee the complete accuracy, completeness, or timeliness of any listing information.'
        },
        {
            id: 'conduct',
            title: '4. Prohibited Conduct',
            content: 'You agree not to use our platform for any unlawful purpose or in any way that violates the rights of others. This includes, but is not limited to, harassment, spam, and unauthorized scraping.'
        },
        {
            id: 'liability',
            title: '5. Limitation of Liability',
            content: 'We are not liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of our services or reliance on property information.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Top Accent Strip */}
            <div className="w-full h-1 bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300" />

            <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    <header className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                            Terms of <span className="text-emerald-600 italic">Service.</span>
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
                        Questions? Contact our legal team at legal@realestate.com
                    </footer>
                </div>
            </main>
        </div>
    );
}
