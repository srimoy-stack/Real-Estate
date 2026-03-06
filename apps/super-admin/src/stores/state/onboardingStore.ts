import { create } from 'zustand';
import { OnboardingState, provisionOrganization, ProvisioningProgress } from '@repo/services';

interface OnboardingStore {
    step: number;
    data: OnboardingState;
    provisioning: {
        isProcessing: boolean;
        currentStep: ProvisioningProgress | null;
        error: string | null;
    };
    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (data: Partial<OnboardingState>) => void;
    updateOrgDetails: (details: Partial<OnboardingState['orgDetails']>) => void;
    updateAdminUser: (admin: Partial<OnboardingState['adminUser']>) => void;
    updateWebsiteSetup: (setup: Partial<OnboardingState['websiteSetup']>) => void;
    updateModules: (modules: Partial<OnboardingState['modules']>) => void;
    reset: () => void;
    startProvisioning: (onSuccess: () => void) => Promise<void>;
}

const initialData: OnboardingState = {
    clientType: null,
    orgDetails: {
        legalName: '',
        displayName: '',
        address: '',
        province: '',
        timezone: 'America/Toronto',
        phone: '',
        email: '',
    },
    adminUser: {
        firstName: '',
        lastName: '',
        email: '',
    },
    websiteSetup: {
        templateId: '',
        domain: '',
        language: 'en',
        leadRouting: 'round-robin',
    },
    modules: {
        listings: true,
        mapSearch: true,
        blog: true,
        leadCRM: true,
        emailNotifications: true,
        sms: false,
        analytics: true,
        teamManagement: true,
        neighborhoodPages: true,
    },
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
    step: 1,
    data: initialData,
    provisioning: {
        isProcessing: false,
        currentStep: null,
        error: null,
    },

    setStep: (step) => set({ step }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

    updateData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
    })),

    updateOrgDetails: (details) => set((state) => ({
        data: { ...state.data, orgDetails: { ...state.data.orgDetails, ...details } }
    })),

    updateAdminUser: (admin) => set((state) => ({
        data: { ...state.data, adminUser: { ...state.data.adminUser, ...admin } }
    })),

    updateWebsiteSetup: (setup) => set((state) => ({
        data: { ...state.data, websiteSetup: { ...state.data.websiteSetup, ...setup } }
    })),

    updateModules: (modules) => set((state) => ({
        data: { ...state.data, modules: { ...state.data.modules, ...modules } }
    })),

    reset: () => set({ step: 1, data: initialData, provisioning: { isProcessing: false, currentStep: null, error: null } }),

    startProvisioning: async (onSuccess) => {
        set({ provisioning: { isProcessing: true, currentStep: null, error: null } });

        try {
            await provisionOrganization(get().data, (progress) => {
                set((state) => ({
                    provisioning: { ...state.provisioning, currentStep: progress }
                }));
            });
            set({ provisioning: { isProcessing: false, currentStep: { step: 'complete', label: 'Redirecting...', progress: 100 }, error: null } });
            onSuccess();
        } catch (error: any) {
            set({ provisioning: { isProcessing: false, currentStep: null, error: error.message || 'Provisioning failed' } });
        }
    },
}));
