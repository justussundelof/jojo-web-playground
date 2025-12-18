'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import type { AuthContextType, Profile, UserRole, AuthResult, AuthError } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    // Core Auth State
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)

    // Derived State
    const [role, setRole] = useState<UserRole | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Loading States
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(false)

    // Error State
    const [error, setError] = useState<AuthError | null>(null)

    const supabase = createClient()
    const fetchIdRef = useRef(0)

    // Fetch profile from database
    const fetchProfile = useCallback(async (userId: string) => {
        const currentFetchId = ++fetchIdRef.current
        setProfileLoading(true)

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // Only update if this is still the latest fetch
            if (currentFetchId === fetchIdRef.current) {
                if (fetchError) {
                    console.error('Error fetching profile:', fetchError)
                    setError({
                        code: 'profile_not_found',
                        message: 'Account setup incomplete. Please contact support.',
                        status: fetchError.code ? parseInt(fetchError.code) : undefined
                    })
                    setProfile(null)
                    setRole(null)
                    setIsAdmin(false)
                } else if (data) {
                    setProfile(data as Profile)
                    setRole(data.role as UserRole)
                    setIsAdmin(data.role === 'admin')
                    setError(null)
                }
            }
        } catch (err) {
            if (currentFetchId === fetchIdRef.current) {
                console.error('Unexpected error fetching profile:', err)
                setError({
                    code: 'unknown_error',
                    message: 'An unexpected error occurred'
                })
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setProfileLoading(false)
            }
        }
    }, [supabase])

    // Force refresh profile data
    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }, [user, fetchProfile])

    // Clear error state
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Map Supabase errors to user-friendly messages
    const mapAuthError = (error: SupabaseAuthError): AuthError => {
        const errorMap: Record<string, string> = {
            'invalid_credentials': 'Invalid email or password',
            'user_already_exists': 'An account with this email already exists',
            'weak_password': 'Password must be at least 6 characters',
            'email_not_confirmed': 'Please verify your email address',
            'over_email_send_rate_limit': 'Too many attempts. Please wait and try again'
        }

        return {
            code: error.name || 'auth_error',
            message: errorMap[error.name] || error.message || 'An error occurred during authentication',
            status: error.status
        }
    }

    // Initialize auth state
    useEffect(() => {
        let isMounted = true

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted) {
                setSession(session)
                setUser(session?.user ?? null)
                setIsAuthenticated(!!session?.user)

                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setLoading(false)
                }
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)
                setIsAuthenticated(!!session?.user)

                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchProfile(session.user.id)
                } else if (event === 'SIGNED_OUT') {
                    // Reset all state on sign out
                    setProfile(null)
                    setRole(null)
                    setIsAdmin(false)
                    setError(null)
                } else if (event === 'TOKEN_REFRESHED') {
                    // Session updated, but profile unchanged
                    // No action needed
                } else if (event === 'USER_UPDATED' && session?.user) {
                    // User data changed, refresh profile
                    await fetchProfile(session.user.id)
                }

                setLoading(false)
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [supabase.auth, fetchProfile])

    // Sign up
    const signUp = async (email: string, password: string): Promise<AuthResult> => {
        try {
            clearError()

            if (password.length < 6) {
                const error: AuthError = {
                    code: 'weak_password',
                    message: 'Password must be at least 6 characters'
                }
                setError(error)
                return { success: false, error: error.message }
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password
            })

            if (signUpError) {
                const error = mapAuthError(signUpError)
                setError(error)
                return { success: false, error: error.message }
            }

            return { success: true, data }
        } catch (err) {
            const error: AuthError = {
                code: 'network_error',
                message: 'Connection error. Please try again'
            }
            setError(error)
            return { success: false, error: error.message }
        }
    }

    // Sign in
    const signIn = async (email: string, password: string): Promise<AuthResult> => {
        try {
            clearError()

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                const error = mapAuthError(signInError)
                setError(error)
                return { success: false, error: error.message }
            }

            // Profile will be fetched automatically by onAuthStateChange
            return { success: true, data }
        } catch (err) {
            const error: AuthError = {
                code: 'network_error',
                message: 'Connection error. Please try again'
            }
            setError(error)
            return { success: false, error: error.message }
        }
    }

    // Sign out
    const signOut = async () => {
        try {
            clearError()
            const { error: signOutError } = await supabase.auth.signOut()

            if (signOutError) {
                const error = mapAuthError(signOutError)
                setError(error)
                throw error
            }

            // State will be reset automatically by onAuthStateChange
        } catch (err) {
            console.error('Sign out error:', err)
            throw err
        }
    }

    // Reset password
    const resetPassword = async (email: string): Promise<AuthResult> => {
        try {
            clearError()

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (resetError) {
                const error = mapAuthError(resetError)
                setError(error)
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (err) {
            const error: AuthError = {
                code: 'network_error',
                message: 'Connection error. Please try again'
            }
            setError(error)
            return { success: false, error: error.message }
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            role,
            isAdmin,
            isAuthenticated,
            loading,
            profileLoading,
            error,
            signUp,
            signIn,
            signOut,
            resetPassword,
            refreshProfile,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}

// Re-export types for convenience
export type { UserRole, Profile, AuthError, AuthResult }