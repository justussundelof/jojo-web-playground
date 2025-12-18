'use client'

import { useAuth, type UserRole } from '@/context/AuthContext'

export function useRole() {
    const { role, isAdmin, loading, profileLoading } = useAuth()

    const isLoading = loading || profileLoading

    const hasRole = (requiredRole: UserRole): boolean => {
        if (isLoading) return false
        return role === requiredRole
    }

    const hasAnyRole = (roles: UserRole[]): boolean => {
        if (isLoading) return false
        return role !== null && roles.includes(role)
    }

    return {
        role,
        isAdmin,
        isUser: role === 'user',
        loading: isLoading,
        hasRole,
        hasAnyRole,
    }
}
