"use client";

import { Card, CardAction, CardContent, CardDescription } from "../ui/card";
import Image from "next/image";
import type { Product } from "@/types/product";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

interface ProductCardProps {
  product: Product;
  showText: boolean;
  setShowText: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProductCard({
  product,
  showText,
  setShowText,
}: ProductCardProps) {
  const imageUrl = product.img_url
    ? optimizeCloudinaryImage(product.img_url, {
        width: 800,
        height: 1066,
        quality: "auto",
        crop: "fill",
        gravity: "auto",
      })
    : null;

  const isOutOfStock = !product.in_stock;

  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover={isOutOfStock ? "rest" : "hover"}
      className="relative w-full"
    >
      <Card className="relative w-full bg-background overflow-hidden border-0 cursor-pointer ">
        {/* IMAGE */}
        <CardContent className="p-0">
          <div className="relative w-full aspect-3/4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title || "Product"}
                fill
                className="object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-40">
                NO IMAGE
              </div>
            )}
          </div>
        </CardContent>

        {/* OUT OF STOCK OVERLAY (always visible) */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="text-xs font-mono tracking-wide uppercase">
              Out of stock
            </span>
          </div>
        )}
        {/* MOBILE INFO – always visible */}
        {showText && (
          <CardDescription className="flex flex-col">
            <h2 className="text-sm font-serif-book truncate w-2/3">
              {product.title}
            </h2>
            <span className="flex gap-x-3 items-baseline">
              <p className="text-xs font-mono uppercase">{product.price} SEK</p>
              {product.size && (
                <p className="text-xs font-serif-display uppercase text-muted ">
                  {product.size.name}
                </p>
              )}
            </span>
          </CardDescription>
        )}

        {/* HOVER INFO OVERLAY (desktop only) */}
      </Card>
    </motion.div>
  );
}
