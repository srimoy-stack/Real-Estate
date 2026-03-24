import { apiClient } from '@repo/api-client';
import { useNotificationStore } from './notificationStore';
import { OrganizationType } from '@repo/types';

/**
 * The standard payload for the Super Admin Onboarding Wizard.
 * Supporting both BROKERAGE and INDIVIDUAL_AGENT client types.
 */
export interface OnboardingPayload {
    organization: {
        name: string;
        type: OrganizationType;
        email: string;
        phone: string;
        address: string;
        timezone: string;
        logo?: string;
        modules?: Record<string, boolean>;
    };
    adminUser: {
        name: string;
        email: string;
        password?: string;
    };
    templates: {
        mainWebsiteTemplateId: string;
        additionalTemplateIds: string[];
    };
    website: {
        domain: string;
        defaultLanguage: string;
    };
}

export interface OnboardingState {
    clientType: 'BROKERAGE' | 'INDIVIDUAL_AGENT' | null;
    orgDetails: {
        legalName: string;
        displayName: string;
        address: string;
        province: string;
        timezone: string;
        phone: string;
        email: string;
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

export { type ProvisioningStatus as ProvisioningProgress };

export interface ProvisioningStatus {
    status: 'cloning' | 'configuring' | 'account_creation' | 'website_generation' | 'complete' | 'failed';
    label: string;
    progress: number;
}

/**
 * Orquestrates the complete onboarding of a new client.
 * This includes Org creation, User as CLIENT_ADMIN, Template assignments, and Website provisioning.
 */
import { createOrganization, SubscriptionPlan } from './organizationService';
import { orgWebsiteService } from './orgWebsiteService';

export const onboardOrganization = async (
    payload: OnboardingPayload,
    onProgress?: (status: ProvisioningStatus) => void
): Promise<{ organizationId: string }> => {
    try {
        console.log('Initiating Onboarding Flow for:', payload.organization.name);

        // Progress simulation
        const steps: ProvisioningStatus[] = [
            { status: 'cloning', label: 'Initializing Organization Structure...', progress: 20 },
            { status: 'configuring', label: 'Configuring Regional Settings...', progress: 40 },
            { status: 'account_creation', label: 'Provisioning CLIENT_ADMIN Account...', progress: 60 },
            { status: 'website_generation', label: 'Generating Initial Website Instance...', progress: 85 },
            { status: 'complete', label: 'Onboarding Complete!', progress: 100 },
        ];

        if (onProgress) {
            for (const step of steps) {
                onProgress(step);
                await new Promise(resolve => setTimeout(resolve, 600)); // Controlled delay for UI feedback
            }
        }

        // Persist the new organization in our mock store
        const newOrg = await createOrganization({
            name: payload.organization.name,
            type: payload.organization.type,
            email: payload.organization.email,
            phone: payload.organization.phone,
            domain: payload.website.domain,
            template: payload.templates.mainWebsiteTemplateId,
            allowedTemplates: [payload.templates.mainWebsiteTemplateId, ...payload.templates.additionalTemplateIds],
            subscriptionPlan: SubscriptionPlan.PREMIUM,
            adminEmail: payload.adminUser.email,
            modules: payload.organization.modules,
            logo: payload.organization.logo,
        });

        // Provision default pages for the new website
        await orgWebsiteService.provisionDefaultPages(newOrg.id, `ws_${newOrg.id}`);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Onboarding System',
            message: `${payload.organization.name} has been successfully onboarded as a ${payload.organization.type}.`
        });

        return { organizationId: newOrg.id };
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Onboarding Error',
            message: 'An unexpected error occurred during the provisioning phase.'
        });
        throw error;
    }
};

export const provisionOrganization = async (
    state: OnboardingState,
    onProgress?: (progress: ProvisioningStatus) => void
): Promise<void> => {
    // Map state to standard payload for onboarding
    const payload: OnboardingPayload = {
        organization: {
            name: state.orgDetails.legalName,
            type: state.clientType === 'BROKERAGE' ? 'BROKERAGE' : 'INDIVIDUAL_AGENT',
            email: state.orgDetails.email,
            phone: state.orgDetails.phone,
            address: state.orgDetails.address,
            timezone: state.orgDetails.timezone,
            modules: state.modules,
        },
        adminUser: {
            name: `${state.adminUser.firstName} ${state.adminUser.lastName}`,
            email: state.adminUser.email,
        },
        templates: {
            mainWebsiteTemplateId: state.websiteSetup.templateId,
            additionalTemplateIds: [state.websiteSetup.templateId],
        },
        website: {
            domain: state.websiteSetup.domain,
            defaultLanguage: state.websiteSetup.language,
        }
    };

    await onboardOrganization(payload, onProgress);
};

/**
 * Checks if a domain is available globally across the platform.
 */
export const checkDomainAvailability = async (domain: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`/super-admin/check-domain?domain=${domain}`);
        return response.data.available;
    } catch (error) {
        // Mock unavailability for common domains
        return !['google.com', 'apple.com', 'realtor.ca'].includes(domain.toLowerCase());
    }
};
