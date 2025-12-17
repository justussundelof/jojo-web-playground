'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            await resetPassword(email)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl mb-8 tracking-tight">Reset Password</h1>

                <form onSubmit={handleResetPassword} className="space-y-6">
                    {error && (
                        <div className="text-sm text-red-600 border border-red-600 px-4 py-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-sm text-green-600 border border-green-600 px-4 py-3">
                            Check your email for a password reset link.
                        </div>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-black focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white px-4 py-3 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm space-y-2">
                    <Link href="/login" className="block underline">
                        Back to Login
                    </Link>
                    <div>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}