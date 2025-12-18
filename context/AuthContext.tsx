'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

// Types
export type UserRole = 'user' | 'admin'

export interface Profile {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    role: UserRole
    created_at: string
    updated_at: string
}

export interface AuthError {
    code: string
    message: string
}

export interface AuthResult {
    success: boolean
    error?: string
}

interface AuthContextType {
    // Core State
    user: User | null
    session: Session | null
    profile: Profile | null

    // Derived State
    role: UserRole | null
    isAdmin: boolean
    isAuthenticated: boolean

    // Loading States
    loading: boolean
    profileLoading: boolean

    // Error State
    error: AuthError | null

    // Actions
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>
    signIn: (email: string, password: string) => Promise<AuthResult>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<AuthResult>
    refreshProfile: () => Promise<void>
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(false)
    const [error, setError] = useState<AuthError | null>(null)

    // Track fetch requests to prevent race conditions
    const fetchIdRef = useRef(0)

    const supabase = createClient()

    // Derived state
    const role = profile?.role ?? null
    const isAdmin = role === 'admin'
    const isAuthenticated = user !== null

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
            if (currentFetchId !== fetchIdRef.current) return

            if (fetchError) {
                console.error('Error fetching profile:', fetchError)
                setError({ code: 'profile_fetch_failed', message: fetchError.message })
                setProfile(null)
            } else {
                setProfile(data as Profile)
                setError(null)
            }
        } catch (err) {
            if (currentFetchId === fetchIdRef.current) {
                setError({ code: 'profile_fetch_failed', message: 'Failed to fetch profile' })
                setProfile(null)
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setProfileLoading(false)
            }
        }
    }, [supabase])

    // Public method to refresh profile
    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }, [user, fetchProfile])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Initialize auth state
    useEffect(() => {
        let isMounted = true

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (err) {
                console.error('Error initializing auth:', err)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)

                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchProfile(session.user.id)
                } else if (event === 'SIGNED_OUT') {
                    // Reset all state on sign out
                    setProfile(null)
                    setError(null)
                    fetchIdRef.current++
                }

                setLoading(false)
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [supabase, fetchProfile])

    const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<AuthResult> => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    }
                }
            })

            if (error) {
                setError({ code: 'signup_failed', message: error.message })
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed'
            setError({ code: 'signup_failed', message })
            return { success: false, error: message }
        }
    }

    const signIn = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })

            if (error) {
                setError({ code: 'signin_failed', message: error.message })
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed'
            setError({ code: 'signin_failed', message })
            return { success: false, error: message }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                setError({ code: 'signout_failed', message: error.message })
                throw error
            }
            // State will be reset by onAuthStateChange listener
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign out failed'
            setError({ code: 'signout_failed', message })
            throw err
        }
    }

    const resetPassword = async (email: string): Promise<AuthResult> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError({ code: 'reset_failed', message: error.message })
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Password reset failed'
            setError({ code: 'reset_failed', message })
            return { success: false, error: message }
        }
    }

    return (
        <AuthContext.Provider value={{
            // Core State
            user,
            session,
            profile,

            // Derived State
            role,
            isAdmin,
            isAuthenticated,

            // Loading States
            loading,
            profileLoading,

            // Error State
            error,

            // Actions
            signUp,
            signIn,
            signOut,
            resetPassword,
            refreshProfile,
            clearError,
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
