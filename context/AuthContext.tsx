'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

export type UserRole = 'user' | 'admin'

interface Profile {
    id: string
    email: string
    role: UserRole
    first_name: string | null
    last_name: string | null
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    role: UserRole | null
    loading: boolean
    isAdmin: boolean
    signUp: (email: string, password: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    const fetchProfile = async (userId: string, userEmail?: string) => {
        try {
            console.log('Fetching profile for user:', userId)

            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            console.log('Profile fetch result:', { data, error, errorCode: error?.code, errorMessage: error?.message })

            // If profile doesn't exist, create it
            if (error && error.code === 'PGRST116') {
                console.log('Profile not found, creating one...')

                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: userEmail || '',
                        role: 'user'
                    })

                if (insertError) {
                    console.error('Error creating profile:', insertError)
                    return null
                }

                // Fetch again after creating
                const result = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()

                console.log('Profile after creation:', result)
                data = result.data
            } else if (error) {
                console.error('Error fetching profile - Code:', error?.code, 'Message:', error?.message, 'Details:', error?.details, 'Hint:', error?.hint)
                // Don't return null immediately, let the app continue
                // The user might still be able to use the app
            }

            return data as Profile
        } catch (err) {
            console.error('Unexpected error in fetchProfile:', err)
            return null
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id, session.user.email)
                setProfile(profileData)
            }

            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id, session.user.email)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
    }

    const role = profile?.role ?? null
    const isAdmin = profile?.role === 'admin'

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            role,
            loading,
            isAdmin,
            signUp,
            signIn,
            signOut,
            resetPassword
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