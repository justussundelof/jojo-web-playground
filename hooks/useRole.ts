'use client'

import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/context/AuthContext'

export function useRole() {
    const { role, isAdmin, loading } = useAuth()

    const hasRole = (requiredRole: UserRole): boolean => {
        if (loading) return false
        return role === requiredRole
    }

    const hasAnyRole = (roles: UserRole[]): boolean => {
        if (loading) return false
        return role !== null && roles.includes(role)
    }

    return {
        role,
        isAdmin,
        loading,
        hasRole,
        hasAnyRole,
        isUser: role === 'user'
    }
}