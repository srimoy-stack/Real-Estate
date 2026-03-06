'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // In production, send to Sentry or similar observability tool
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 animate-in fade-in duration-700">
                    <div className="h-20 w-20 bg-amber-100 rounded-[28px] flex items-center justify-center mb-8 shadow-inner">
                        <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter italic">Something went <span className="text-rose-600">sideways</span>.</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-10 text-sm">
                        The module encountered an unexpected state. Our engineering team has been notified of the disturbance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                            className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-950/20"
                        >
                            Retry Operation
                        </button>
                        <a
                            href="/dashboard"
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                        >
                            Return to Dashboard
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
