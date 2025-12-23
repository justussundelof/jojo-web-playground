'use client'

import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_COST = 49

export default function CheckoutPage() {
    const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart()
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const canceled = searchParams.get('canceled')

    useEffect(() => {
        if (canceled === 'true') {
            setError('Payment was canceled. Please try again.')
        }
    }, [canceled])

    const TAX_RATE = 0.25 // 25% Swedish VAT
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const tax = (subtotal + shipping) * TAX_RATE
    const total = subtotal + shipping + tax

    const handleCheckout = async () => {
        if (!user) {
            router.push('/?login=true&redirectTo=/checkout')
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

    const handleDemoOrder = () => {
        setLoading(true)
        // Simulate order processing
        setTimeout(() => {
            clearCart()
            setSuccess(true)
            setLoading(false)
        }, 1500)
    }

    if (success) {
        return (
            <div className="jojo-main-wrapper-top min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-mono">Order Confirmed!</h2>
                    <p className="font-serif-book text-sm text-accent-foreground/70">
                        Thank you for your demo order. In a real scenario, you would receive a confirmation email.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/profile">
                            <Button variant="outline" className="w-full">View Orders</Button>
                        </Link>
                        <Link href="/">
                            <Button className="w-full">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="jojo-main-wrapper-top min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-mono">Your cart is empty</h2>
                    <Link href="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="jojo-main-wrapper-top min-h-screen">
            <div className="jojo-container-padding max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-xs font-mono">
                        <li>
                            <Link href="/" className="hover:underline">HOME</Link>
                        </li>
                        <li>/</li>
                        <li className="text-accent-foreground/70">CHECKOUT</li>
                    </ol>
                </nav>

                <h1 className="text-2xl font-mono mb-8">CHECKOUT</h1>

                {error && (
                    <div className="mb-6 p-4 border border-red-600 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Forms */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="border-2 border-primary p-6">
                            <h2 className="font-mono text-sm uppercase tracking-wide mb-4">Shipping Address</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="First Name" disabled className="bg-gray-50" />
                                    <Input placeholder="Last Name" disabled className="bg-gray-50" />
                                </div>
                                <Input placeholder="Address" disabled className="bg-gray-50" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="City" disabled className="bg-gray-50" />
                                    <Input placeholder="Postal Code" disabled className="bg-gray-50" />
                                </div>
                                <Input placeholder="Country" defaultValue="Sweden" disabled className="bg-gray-50" />
                                <p className="text-xs text-accent-foreground/50 font-serif-book">
                                    Address form is a placeholder. Full functionality coming soon.
                                </p>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="border-2 border-primary p-6">
                            <h2 className="font-mono text-sm uppercase tracking-wide mb-4">Payment</h2>
                            <div className="py-8 text-center">
                                <p className="font-serif-book text-sm text-accent-foreground/70 mb-2">
                                    Stripe + Shopify integration coming soon.
                                </p>
                                <p className="text-xs text-accent-foreground/50">
                                    Use the Demo button below to simulate an order.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-6">
                        <div className="border-2 border-primary p-6">
                            <h2 className="font-mono text-sm uppercase tracking-wide mb-4">Order Summary</h2>

                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-3 border-b border-primary/30">
                                        <div className="relative w-16 h-20 bg-gray-100 flex-shrink-0">
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-serif-book text-sm truncate">{item.name}</p>
                                            <p className="font-mono text-xs text-accent-foreground/70">
                                                {item.quantity} × {item.price} kr
                                            </p>
                                        </div>
                                        <p className="font-mono text-sm">
                                            {(item.price * item.quantity)} kr
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 space-y-2 text-sm font-mono">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{subtotal} kr</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            `${shipping} kr`
                                        )}
                                    </span>
                                </div>
                                {subtotal < FREE_SHIPPING_THRESHOLD && (
                                    <p className="text-xs text-accent-foreground/50">
                                        Free shipping on orders over {FREE_SHIPPING_THRESHOLD} kr
                                    </p>
                                )}
                                <div className="flex justify-between">
                                    <span>VAT (25%)</span>
                                    <span>{Math.round(tax)} kr</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-primary pt-3 mt-3">
                                    <span>Total</span>
                                    <span>{Math.round(total)} kr</span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Actions */}
                        <div className="space-y-3">
                            {!isAuthenticated && (
                                <div className="p-4 border-2 border-primary bg-accent text-sm">
                                    <p className="font-serif-book mb-3">Please log in to checkout</p>
                                    <Link href="/?login=true&redirectTo=/checkout">
                                        <Button size="sm">Log In</Button>
                                    </Link>
                                </div>
                            )}

                            <Button
                                onClick={handleDemoOrder}
                                disabled={loading || !isAuthenticated}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? 'Processing...' : `Place Order (Demo) - ${Math.round(total)} kr`}
                            </Button>

                            <Link href="/">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}