'use client'

import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
    const { items, subtotal, removeItem, updateQuantity } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const canceled = searchParams.get('canceled')

    useEffect(() => {
        if (canceled === 'true') {
            setError('Payment was canceled. Please try again.')
        }
    }, [canceled])

    const TAX_RATE = 0.25 // 25% Swedish VAT
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login?redirect=/checkout')
            return
        }

        if (items.length === 0) {
            setError('Your cart is empty')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerEmail: user.email,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session')
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No checkout URL received')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process checkout')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl">Your cart is empty</h2>
                    <Link href="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>

                {error && (
                    <div className="mb-6 p-4 border border-red-600 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Order Summary */}
                <div className="bg-white border border-black p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-3 border-b">
                                <div className="relative w-20 h-20 bg-gray-100">
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">{item.price} SEK</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </Button>
                                        <span className="text-sm">{item.quantity}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(item.id)}
                                            className="ml-auto text-red-600"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                                <p className="font-medium">
                                    {(item.price * item.quantity).toFixed(0)} SEK
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(0)} SEK</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT (25%)</span>
                            <span>{tax.toFixed(0)} SEK</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>{total.toFixed(0)} SEK</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Actions */}
                <div className="space-y-4">
                    {!user && (
                        <div className="p-4 border border-black bg-gray-50 text-sm">
                            <p className="mb-2">Please log in to checkout</p>
                            <Link href="/login?redirect=/checkout">
                                <Button size="sm">Log In</Button>
                            </Link>
                        </div>
                    )}

                    <Button
                        onClick={handleCheckout}
                        disabled={loading || !user}
                        className="w-full bg-black text-white py-6 hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {loading ? 'Processing...' : `Proceed to Payment - ${total.toFixed(0)} SEK`}
                    </Button>

                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}