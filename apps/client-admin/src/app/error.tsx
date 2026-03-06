'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full flex flex-col items-center justify-center p-16 bg-white rounded-[48px] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 bg-rose-50 rounded-[32px] flex items-center justify-center mb-10 shadow-inner mx-auto">
          <svg className="h-12 w-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">Application <span className="text-rose-600 underline decoration-rose-500/20 underline-offset-8">Disturbance</span>.</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-12">
          We encountered a critical failure in the application core. Our monitoring systems have captured this event for immediate resolution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-950/20"
          >
            Retry Session
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all font-medium"
          >
            Back to Dashboard
          </button>
        </div>
        {error.digest && (
          <p className="mt-12 text-[9px] font-mono text-slate-400 uppercase tracking-widest">Digest: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
