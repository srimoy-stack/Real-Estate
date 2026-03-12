import { TenantTemplate } from '@repo/types';

// Mock database for organization assignments
let organizationTemplates: TenantTemplate[] = [
    {
        id: 'tt_001',
        organizationId: 'org-1', // Matches mock data in organizationService
        templateId: 'modern-realty',
        assignedBy: 'admin_001',
        createdAt: new Date().toISOString(),
        isActive: true,
    }
];

/**
 * Service to handle template assignments to organizations.
 * Linking templates (from the template library/engine) to specific brokerages.
 */
export const templateAssignmentService = {
    /**
     * Get all templates assigned to a specific organization
     */
    getTemplatesByTenant: async (organizationId: string): Promise<TenantTemplate[]> => {
        return organizationTemplates.filter(t => t.organizationId === organizationId && t.isActive);
    },

    /**
     * Assign a template to an organization
     */
    assignTemplate: async (data: { organizationId: string; templateId: string; adminId: string }): Promise<TenantTemplate> => {
        const newAssignment: TenantTemplate = {
            id: `tt_${Math.random().toString(36).substr(2, 9)}`,
            organizationId: data.organizationId,
            templateId: data.templateId,
            assignedBy: data.adminId,
            createdAt: new Date().toISOString(),
            isActive: true,
        };
        organizationTemplates.push(newAssignment);
        return newAssignment;
    },

    /**
     * Remove an assignment (soft delete / deactivate)
     */
    removeAssignment: async (id: string): Promise<void> => {
        const index = organizationTemplates.findIndex(t => t.id === id);
        if (index !== -1) {
            organizationTemplates[index].isActive = false;
        }
    },

    /**
     * Get all assignments (for Super Admin dashboard overview)
     */
    getAllAssignments: async (): Promise<TenantTemplate[]> => {
        return organizationTemplates;
    }
};

/**
 * Legacy/Standalone helper for the UI components
 */
export const assignTemplateToTenant = async (organizationId: string, templateId: string, adminId: string = 'super-admin'): Promise<TenantTemplate> => {
    return templateAssignmentService.assignTemplate({ organizationId, templateId, adminId });
};
