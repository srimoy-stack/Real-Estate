import { ListingGridSkeleton } from '@/components/listings/ListingSkeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-50/30 pt-24 pb-20">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="mb-10 space-y-4 animate-pulse">
                    <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                    <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                    <div className="h-4 w-40 bg-slate-100 rounded-lg" />
                </div>
                <div className="flex flex-col lg:flex-row gap-10">
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="h-[600px] bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    </aside>
                    <div className="flex-1">
                        <ListingGridSkeleton count={6} />
                    </div>
                </div>
            </div>
        </main>
    );
}
