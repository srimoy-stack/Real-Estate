import { create } from 'zustand';
import { SectionConfig, SectionType } from '@repo/types';

interface WebsiteBuilderState {
    sections: SectionConfig[];
    selectedSectionId: string | null;
    isDirty: boolean;

    // Actions
    setSections: (sections: SectionConfig[]) => void;
    updateSection: (id: string, updates: Partial<SectionConfig>) => void;
    addSection: (type: SectionType) => void;
    removeSection: (id: string) => void;
    setSelectedSection: (id: string | null) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;
    save: () => Promise<void>;
}

export const useWebsiteBuilderStore = create<WebsiteBuilderState>((set, get) => ({
    sections: [],
    selectedSectionId: null,
    isDirty: false,

    setSections: (sections) => set({ sections, isDirty: false }),

    updateSection: (id, updates) => set((state) => ({
        sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        isDirty: true,
    })),

    addSection: (type) => {
        const newSection: SectionConfig = {
            id: `section-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
            isVisible: true,
            isLocked: false,
            order: get().sections.length,
            content: { _type: type as any } as any, // Initialize with basic type
            config: {}, // Default to empty config — populated by future section editors
        };
        set((state) => ({
            sections: [...state.sections, newSection],
            isDirty: true,
        }));
    },

    removeSection: (id) => set((state) => ({
        sections: state.sections.filter((s) => s.id !== id),
        isDirty: true,
        selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
    })),

    setSelectedSection: (id) => set({ selectedSectionId: id }),

    reorderSections: (startIndex, endIndex) => {
        const sections = [...get().sections];
        const [removed] = sections.splice(startIndex, 1);
        sections.splice(endIndex, 0, removed);

        // Update order property
        const updatedSections = sections.map((s, i) => ({ ...s, order: i }));
        set({ sections: updatedSections, isDirty: true });
    },

    save: async () => {
        // This will be connected to the service later
        console.log('Saving sections:', get().sections);
        set({ isDirty: false });
    },
}));
