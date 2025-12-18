'use client'

import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
    const { user, profile, loading, profileLoading, signOut, isAdmin } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <p>Loading...</p>
            </div>
        )
    }

    // User not logged in - middleware should catch this, but just in case
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl">Please sign in to view your account</h2>
                    <Link href="/?login=true">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const displayName = profile?.first_name
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : 'there'

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-2xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-3xl font-serif-display mb-2">Account</h1>
                    <p className="text-lg">
                        Welcome, {profileLoading ? '...' : displayName}!
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                {/* Profile Information */}
                <div className="border border-border p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Profile Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">First Name</span>
                            <span>{profileLoading ? '...' : (profile?.first_name || 'Not set')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Last Name</span>
                            <span>{profileLoading ? '...' : (profile?.last_name || 'Not set')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Email</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Account Type</span>
                            <span className="capitalize">{profileLoading ? '...' : (profile?.role || 'user')}</span>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="border border-border p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Your Orders</h2>
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4">No orders yet</p>
                        <Link href="/">
                            <Button variant="outline">Start Shopping</Button>
                        </Link>
                    </div>
                </div>

                {/* Admin Link */}
                {isAdmin && (
                    <div className="border border-border p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">Admin</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            You have admin access to manage the store.
                        </p>
                        <Link href="/admin">
                            <Button>Go to Admin Dashboard</Button>
                        </Link>
                    </div>
                )}

                {/* Account Actions */}
                <div className="space-y-4">
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    )
}
