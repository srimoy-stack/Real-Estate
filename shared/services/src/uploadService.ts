import { apiClient } from '@repo/api-client';

export interface UploadResponse {
    url: string;
    key: string;
    type: string;
    name: string;
    size: number;
}

export const uploadService = {
    uploadFile: async (file: File, folder: 'listing' | 'branding' | 'avatar' = 'branding'): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await apiClient.post<UploadResponse>('/uploads/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    uploadMultiple: async (files: FileList | File[], folder: 'listing' | 'branding' = 'listing'): Promise<UploadResponse[]> => {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await apiClient.post<UploadResponse[]>('/uploads/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    deleteFile: async (key: string): Promise<void> => {
        await apiClient.delete(`/uploads/file/${key}`);
    }
};
