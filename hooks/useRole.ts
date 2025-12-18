'use client'

import { useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types/auth'

export interface UseRoleReturn {
    role: UserRole | null
    isAdmin: boolean
    isUser: boolean
    loading: boolean
    hasRole: (requiredRole: UserRole) => boolean
    hasAnyRole: (roles: UserRole[]) => boolean
}

export function useRole(): UseRoleReturn {
    const { role, isAdmin, loading } = useAuth()

    const hasRole = useCallback((requiredRole: UserRole): boolean => {
        if (loading) return false
        return role === requiredRole
    }, [role, loading])

    const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
        if (loading) return false
        return role !== null && roles.includes(role)
    }, [role, loading])

    return {
        role,
        isAdmin,
        loading,
        hasRole,
        hasAnyRole,
        isUser: role === 'user'
    }
}