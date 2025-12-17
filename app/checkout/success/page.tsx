'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        // Clear cart after successful payment
        clearCart()
    }, [clearCart])

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="text-6xl mb-4">✓</div>
                <h1 className="text-3xl font-bold">Payment Successful!</h1>
                <p className="text-gray-600">
                    Thank you for your order. You will receive a confirmation email shortly.
                </p>
                {sessionId && (
                    <p className="text-sm text-gray-500">
                        Order Reference: {sessionId.slice(-8)}
                    </p>
                )}
                <div className="pt-6">
                    <Link href="/">
                        <Button className="bg-black text-white px-8 py-6 hover:bg-gray-800">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}