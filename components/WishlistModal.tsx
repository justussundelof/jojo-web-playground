"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface WishlistModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WishlistModal({ open, setOpen }: WishlistModalProps) {
    const { items, removeItem, clearWishlist, itemCount } = useWishlist();
    const { addItem: addToCart } = useCart();

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

    const handleAddToCart = (item: typeof items[0]) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
        });
        removeItem(item.productId);
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
                            Wishlist ({itemCount} {itemCount === 1 ? "item" : "items"})
                        </h1>

                        {items.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="font-serif-book text-sm text-accent-foreground/70">
                                    Your wishlist is empty.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 py-4 border-b border-primary"
                                        >
                                            <div className="relative w-20 h-24 bg-gray-100 flex-shrink-0">
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
                                                <p className="font-mono text-sm mt-1">
                                                    {item.price} kr
                                                </p>
                                                <div className="flex gap-2 mt-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddToCart(item)}
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(item.productId)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearWishlist}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}