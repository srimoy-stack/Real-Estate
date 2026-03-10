import { apiClient } from '@repo/api-client';
import { OrgType } from './organizationService';
import { useNotificationStore } from './notificationStore';

/* ─── Types ────────────────────────────────────────── */

export interface OnboardingState {
    clientType: OrgType | null;
    orgDetails: {
        legalName: string;
        displayName: string;
        address: string;
        province: string;
        timezone: string;
        phone: string;
        email: string;
        logoUrl?: string;
    };
    adminUser: {
        firstName: string;
        lastName: string;
        email: string;
    };
    websiteSetup: {
        templateId: string;
        domain: string;
        language: string;
        leadRouting: 'round-robin' | 'direct' | 'first-response';
    };
    modules: {
        listings: boolean;
        mapSearch: boolean;
        blog: boolean;
        leadCRM: boolean;
        emailNotifications: boolean;
        sms: boolean;
        analytics: boolean;
        teamManagement: boolean;
        neighborhoodPages: boolean;
    };
}

export interface ProvisioningProgress {
    step: 'cloning' | 'pages' | 'branding' | 'modules' | 'account' | 'complete' | 'failed';
    label: string;
    progress: number;
}

/* ─── Service ──────────────────────────────────────── */

export const provisionOrganization = async (
    data: OnboardingState,
    onProgress?: (progress: ProvisioningProgress) => void
): Promise<void> => {
    // Simulate steps with progress
    const steps: ProvisioningProgress[] = [
        { step: 'cloning', label: 'Cloning template library...', progress: 20 },
        { step: 'pages', label: 'Generating default SEO pages...', progress: 40 },
        { step: 'branding', label: 'Assigning brand assets...', progress: 60 },
        { step: 'modules', label: 'Activating selected modules...', progress: 80 },
        { step: 'account', label: 'Creating primary admin account...', progress: 95 },
        { step: 'complete', label: 'Provisioning complete!', progress: 100 },
    ];

    if (onProgress) {
        for (const s of steps) {
            onProgress(s);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate work
        }
    }

    try {
        await apiClient.post('/super-admin/provision', data);
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Provisioning Complete',
            message: `Organization "${data.orgDetails.displayName}" created successfully.`
        });
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Provisioning Failed',
            message: 'Failed to create organization. Please check logs.'
        });
        throw error;
    }
};

export const checkDomainAvailability = async (domain: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`/super-admin/check-domain?domain=${domain}`);
        return response.data.available;
    } catch (error) {
        // Mock check
        return !['demo.com', 'test.com', 'taken.com'].includes(domain.toLowerCase());
    }
};

export const getTemplates = async () => {
    return [
        { id: 'luxury-estate', name: 'Luxury Estate', description: 'Sleek, gold-accented design for premium brokerages.', image: '/templates/luxury-thumb.jpg' },
        { id: 'minimal-realty', name: 'Minimal Realty', description: 'Clean, white-space driven layout for individual agents.', image: '/templates/minimal-thumb.jpg' },
        { id: 'corporate-brokerage', name: 'Corporate Brokerage', description: 'Reliable, accessibility-focused classic design.', image: '/templates/classic-thumb.jpg' },
        { id: 'modern-realty', name: 'Modern Realty', description: 'Vibrant, photo-centric layout for teams.', image: '/templates/modern-thumb.jpg' },
        { id: 'agent-portfolio', name: 'Agent Portfolio', description: 'Personalized design to showcase individual agent performance.', image: '/templates/agent-thumb.jpg' },
    ];
};
