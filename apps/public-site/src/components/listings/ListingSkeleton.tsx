export const ListingSkeleton = () => {
    return (
        <div className="animate-pulse rounded-[32px] bg-white border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="p-6 space-y-5">
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-5 w-20 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-7 w-full bg-slate-200 rounded-xl" />
                    <div className="h-4 w-40 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                <div className="pt-5 border-t border-slate-50 flex justify-between gap-4">
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                    <div className="h-10 w-28 bg-slate-900/5 rounded-xl ml-auto" />
                </div>
            </div>
        </div>
    );
};

export const ListingGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <ListingSkeleton key={i} />
            ))}
        </div>
    );
};

export const ListingDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 h-screen animate-pulse">
                <div className="h-4 w-64 bg-slate-100 rounded-lg mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-6">
                            <div className="flex gap-2"><div className="h-6 w-20 bg-slate-100 rounded-lg" /> <div className="h-6 w-24 bg-slate-100 rounded-lg" /></div>
                            <div className="h-16 w-3/4 bg-slate-200 rounded-3xl" />
                            <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                        </div>
                        <div className="aspect-[21/9] bg-slate-100 rounded-[48px]" />
                        <div className="h-24 bg-slate-50 rounded-[48px]" />
                        <div className="space-y-4">
                            <div className="h-8 w-40 bg-slate-200 rounded-xl" />
                            <div className="h-4 w-full bg-slate-100 rounded-lg" />
                            <div className="h-4 w-full bg-slate-100 rounded-lg" />
                            <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
                        </div>
                    </div>
                    <div className="lg:col-span-4 gap-6 flex flex-col">
                        <div className="h-[500px] bg-slate-50 rounded-[48px]" />
                        <div className="h-32 bg-slate-50 rounded-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

