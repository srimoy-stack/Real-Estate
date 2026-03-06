import { apiClient } from '@repo/api-client';

export type EventProperty = Record<string, string | number | boolean | null>;

export const analyticsService = {
    trackEvent: async (eventName: string, properties: EventProperty = {}): Promise<void> => {
        try {
            await apiClient.post('/analytics/event', {
                eventName,
                properties,
                timestamp: new Date().toISOString(),
                metadata: {
                    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
                    referrer: typeof window !== 'undefined' ? window.document.referrer : 'direct',
                },
            });
        } catch (error) {
            // Silently fail to not interrupt UX
            console.error('Failed to track event:', eventName, error);
        }
    },

    trackPageView: async (url: string = ''): Promise<void> => {
        const path = url || (typeof window !== 'undefined' ? window.location.pathname : '');
        await analyticsService.trackEvent('page_view', { path });
    },

    trackError: async (error: Error, metadata: EventProperty = {}): Promise<void> => {
        await analyticsService.trackEvent('error_occurred', {
            errorMessage: error.message,
            stackTrace: error.stack || 'No stack trace available',
            ...metadata,
        });
    }
};
