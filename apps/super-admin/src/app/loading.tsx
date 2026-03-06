export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        </div>
        <p className="animate-pulse text-sm font-medium text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
