import { create } from 'zustand';
import { Notification, NotificationStore } from '@repo/types';

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9);
        const timestamp = Date.now();
        const autoDismiss = notification.autoDismiss ?? true;
        const duration = notification.duration ?? 5000;

        const newNotification: Notification = {
            ...notification,
            id,
            timestamp,
            autoDismiss,
            duration
        };

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }));

        if (autoDismiss) {
            setTimeout(() => {
                get().removeNotification(id);
            }, duration);
        }

        return id;
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
    clearAll: () => set({ notifications: [] }),
}));
