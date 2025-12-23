"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { dummyOrders } from "@/data/dummyOrders";
import { Order, OrderStatus } from "@/types/order";

interface OrdersModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const statusColors: Record<OrderStatus, string> = {
    processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
    shipped: "bg-blue-100 text-blue-800 border-blue-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<OrderStatus, string> = {
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function OrdersModal({ open, setOpen }: OrdersModalProps) {
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        if (open) {
            window.addEventListener("keydown", handleEscape);
        }
        return () => window.removeEventListener("keydown", handleEscape);
    }, [open, setOpen]);

    const toggleOrder = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 top-0 right-0 left-auto z-50 h-screen overflow-y-auto flex flex-col items-start justify-start px-3 w-full lg:w-1/2 bg-accent border-l border-l-accent-foreground"
                >
                    <Button
                        variant="link"
                        size="sm"
                        className="absolute top-0 z-50 left-0"
                        onClick={() => setOpen(false)}
                    >
                        Close [x]
                    </Button>

                    <div className="mt-16 w-full space-y-6 pb-8">
                        <h1 className="font-mono text-sm uppercase tracking-wide">
                            Orders & Returns
                        </h1>

                        {dummyOrders.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="font-serif-book text-sm text-accent-foreground/70">
                                    You have no orders yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dummyOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border-2 border-primary bg-background"
                                    >
                                        {/* Order Header */}
                                        <button
                                            onClick={() => toggleOrder(order.id)}
                                            className="w-full p-4 text-left"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-mono text-sm">
                                                        Order #{order.orderNumber}
                                                    </p>
                                                    <p className="font-serif-book text-xs text-accent-foreground/70 mt-1">
                                                        {formatDate(order.date)}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-xs font-mono px-2 py-1 border ${statusColors[order.status]}`}
                                                >
                                                    {statusLabels[order.status]}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-serif-book text-sm">
                                                    {order.items.length}{" "}
                                                    {order.items.length === 1 ? "item" : "items"}
                                                </span>
                                                <span className="font-mono text-sm">
                                                    Total: {order.total} kr
                                                </span>
                                            </div>
                                        </button>

                                        {/* Order Details (Expanded) */}
                                        <AnimatePresence>
                                            {expandedOrder === order.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-primary p-4 space-y-3">
                                                        {order.items.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex gap-3 items-center"
                                                            >
                                                                <div className="relative w-12 h-16 bg-gray-100 flex-shrink-0">
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
                                                                    <p className="font-serif-book text-sm truncate">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="font-mono text-xs text-accent-foreground/70">
                                                                        {item.quantity} × {item.price} kr
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="border-t border-primary/30 pt-3 mt-3 space-y-1 text-xs font-mono">
                                                            <div className="flex justify-between">
                                                                <span>Subtotal</span>
                                                                <span>{order.subtotal} kr</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Shipping</span>
                                                                <span>
                                                                    {order.shipping === 0
                                                                        ? "Free"
                                                                        : `${order.shipping} kr`}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Tax (VAT)</span>
                                                                <span>{order.tax} kr</span>
                                                            </div>
                                                            <div className="flex justify-between font-bold pt-1">
                                                                <span>Total</span>
                                                                <span>{order.total} kr</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}