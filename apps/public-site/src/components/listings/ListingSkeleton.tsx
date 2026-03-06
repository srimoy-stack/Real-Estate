export const ListingSkeleton = () => {
    return (
        <div className="animate-pulse rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <div className="h-2 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-3 w-40 bg-slate-200 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                    <div className="h-8 bg-slate-200 rounded" />
                    <div className="h-8 bg-slate-200 rounded" />
                    <div className="h-8 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    );
};

export const ListingGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ListingSkeleton key={i} />
            ))}
        </div>
    );
};

