import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { AuthState, User } from "./authTypes"

interface AuthActions {
    setAuth: (user: User, token: string) => void
    setToken: (token: string | null) => void
    logout: () => void
    startImpersonation: (original: User, impersonated: User) => void
    stopImpersonation: () => void
    setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions & { _hasHydrated: boolean }>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isImpersonating: false,
            originalUser: null,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            setAuth: (user, token) =>
                set({
                    user,
                    accessToken: token,
                    isAuthenticated: true,
                }),

            setToken: (accessToken) => set({ accessToken }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isImpersonating: false,
                    originalUser: null,
                }),

            startImpersonation: (original, impersonated) =>
                set({
                    originalUser: original,
                    user: impersonated,
                    isImpersonating: true,
                }),

            stopImpersonation: () =>
                set((state) => ({
                    user: state.originalUser,
                    originalUser: null,
                    isImpersonating: false,
                })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: (state) => {
                return () => state.setHasHydrated(true);
            },
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                isImpersonating: state.isImpersonating,
                originalUser: state.originalUser,
            }),
        }
    )
)
