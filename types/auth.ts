import { User, Session } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin'

export interface Profile {
    id: string
    email: string
    role: UserRole
    created_at: string
    updated_at: string
}

export interface AuthError {
    code: string
    message: string
    status?: number
}

export interface AuthResult {
    success: boolean
    error?: string
    data?: unknown
}

export interface AuthContextType {
    // State
    user: User | null
    session: Session | null
    profile: Profile | null
    role: UserRole | null
    isAdmin: boolean
    isAuthenticated: boolean
    loading: boolean
    profileLoading: boolean
    error: AuthError | null

    // Actions
    signUp: (email: string, password: string) => Promise<AuthResult>
    signIn: (email: string, password: string) => Promise<AuthResult>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<AuthResult>
    refreshProfile: () => Promise<void>
    clearError: () => void
}