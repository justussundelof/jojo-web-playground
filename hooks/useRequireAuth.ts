'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/auth'

export interface UseRequireAuthOptions {
    redirectTo?: string
    requiredRole?: UserRole
}

export interface UseRequireAuthReturn {
    user: User
    profile: Profile
    isLoading: boolean
}

export function useRequireAuth(options?: UseRequireAuthOptions): UseRequireAuthReturn {
    const { user, profile, loading, profileLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const redirectTo = options?.redirectTo || '/login'
    const requiredRole = options?.requiredRole

    const isLoading = loading || profileLoading

    useEffect(() => {
        // Wait for auth check to complete
        if (isLoading) return

        // Redirect to login if not authenticated
        if (!user) {
            // Store intended path for post-login redirect
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('intendedPath', pathname)
            }
            router.push(redirectTo)
            return
        }

        // Check role requirement if specified
        if (requiredRole && profile?.role !== requiredRole) {
            // User is authenticated but doesn't have required role
            router.push('/')
            return
        }
    }, [user, profile, isLoading, router, redirectTo, requiredRole, pathname])

    // Return typed values (they will be non-null when not loading and authenticated)
    return {
        user: user as User,
        profile: profile as Profile,
        isLoading
    }
}