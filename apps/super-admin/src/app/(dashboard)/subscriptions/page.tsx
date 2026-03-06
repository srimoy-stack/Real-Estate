'use client';

export default function SubscriptionsPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Subscriptions & Billing</h1>
                <p className="mt-2 text-slate-400">Recurring revenue monitoring and plan management</p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-12 text-center backdrop-blur-xl">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 font-bold text-2xl">
                    $
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Automated Revenue Console</h2>
                <p className="text-slate-400 max-w-sm mx-auto">
                    Centralized billing for all platform-wide subscriptions. Integrated with Stripe Connect.
                </p>
            </div>
        </div>
    );
}
