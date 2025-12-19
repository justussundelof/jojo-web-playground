"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";

interface CartModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CartModal({ open, setOpen }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } =
    useCart();

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

          <div className="mt-16 w-full space-y-6 pb-8 flex flex-col h-[calc(100vh-4rem)]">
            <h1 className="font-mono text-sm uppercase tracking-wide">
              Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </h1>

            {items.length === 0 ? (
              <div className="py-12 text-center flex-1">
                <p className="font-serif-book text-sm text-accent-foreground/70">
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 flex-1 overflow-y-auto">
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
                        <div className="flex items-center gap-2 mt-3">
                          <span className="font-mono text-xs">Qty:</span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="font-mono text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="border-t border-primary pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">Subtotal</span>
                    <span className="font-mono text-lg">{subtotal} kr</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
