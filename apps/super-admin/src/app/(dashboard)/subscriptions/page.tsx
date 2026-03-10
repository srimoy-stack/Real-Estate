'use client';

export default function SubscriptionsPage() {
    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Subscriptions & <span className="text-indigo-600">Billing</span></h1>
                <p className="mt-2 text-slate-500 font-medium">Recurring revenue monitoring and plan management</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 font-bold text-2xl shadow-inner border border-amber-100">
                    $
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Automated Revenue Console</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                    Centralized billing for all platform-wide subscriptions. Integrated with Stripe Connect.
                </p>
            </div>
        </div>
    );
}
