'use client';

import { useNotificationStore } from '@repo/services';
import { NotificationType } from '@repo/types';

const NotificationIcon = ({ type }: { type: NotificationType }) => {
    switch (type) {
        case 'success':
            return (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        case 'error':
            return (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            );
        case 'warning':
            return (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 17c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            );
        default:
            return (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
    }
};

export const NotificationManager = () => {
    const { notifications, removeNotification } = useNotificationStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-0 right-0 z-[9999] p-6 space-y-4 w-full max-w-sm pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`
                        pointer-events-auto relative overflow-hidden
                        bg-slate-900/80 backdrop-blur-2xl border border-white/10 
                        rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                        flex items-start gap-4 transition-all duration-500
                        animate-in slide-in-from-right-10 fade-in
                    `}
                >
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-[14px] font-black text-white tracking-tight mb-1 uppercase">
                            {notification.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {notification.message}
                        </p>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};
