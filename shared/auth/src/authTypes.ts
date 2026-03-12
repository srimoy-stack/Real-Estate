export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    CLIENT_ADMIN = "CLIENT_ADMIN",
    AGENT = "AGENT",
    VIEWER = "VIEWER",
}

export interface User {
    id: string
    name: string
    email: string
    role: Role
    organizationId?: string;
    organizationStatus?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    isImpersonating: boolean
    originalUser: User | null
}
