"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { Cross1Icon } from "@radix-ui/react-icons";

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
          className="fixed inset-0 top-0 right-0 left-auto z-50 h-screen overflow-y-auto flex flex-col items-start justify-start p-4 w-md lg:w-1/2 bg-accent border-l border-l-accent-foreground"
        >
          <Button
            variant="secondary"
            size="icon"
            className="text-secondary bg-accent border-accent hover:bg-accent hover:text-background
            
        "
            onClick={() => setOpen(false)}
          >
            <Cross1Icon />
          </Button>

          <div className="pt-20 w-full space-y-4 pb-8 flex flex-col h-[calc(100vh-4rem)]">
            <h1 className="font-display  text-2xl uppercase tracking-wide text-secondary">
              Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </h1>

            {items.length === 0 ? (
              <div className=" text-start flex-1">
                <p className="font-mono text-sm text-secondary">
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 flex-1 overflow-y-auto text-secondary">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 border-b border-secondary"
                    >
                      <div className="relative w-20 h-24 flex-shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-row justify-between items-start w-full  min-w-0">
                        <div className="flex flex-col items-between justify-between w-full h-full ">
                          <p className="font-mono text-xs font-bold truncate">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs ">{item.price} kr</p>
                          <div className="flex items-center gap-2 ">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="font-mono text-xs w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="secondary"
                          size="icon"
                          className="text-secondary bg-accent border-accent hover:bg-accent hover:text-background"
                        >
                          <Cross1Icon />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="border-t border-secondary pt-4 px-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm  text-secondary">
                      Subtotal
                    </span>
                    <span className="text-secondary font-mono text-sm font-bold">
                      {subtotal} SEK
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-6 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="w-full font-mono text-sm"
                  >
                    Continue Shopping
                  </Button>
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full h-12"
                      size="default"
                    >
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
