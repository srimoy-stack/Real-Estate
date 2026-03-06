export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    BROKERAGE_ADMIN = "BROKERAGE_ADMIN",
    AGENT_ADMIN = "AGENT_ADMIN",
}

export interface User {
    id: string
    name: string
    email: string
    role: Role
    tenantId?: string;
    tenantStatus?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    isImpersonating: boolean
    originalUser: User | null
}
