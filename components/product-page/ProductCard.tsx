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
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/90">
            <span className="text-xs  font-mono tracking-wide uppercase text-secondary-foreground">
              Out of stock
            </span>
          </div>
        )}
        {/* MOBILE INFO – always visible */}
        {showText && (
          <CardDescription className="flex flex-col border-b-secondary border-b pt-1">
            <Badge variant="secondary" className=" font-mono pt-0 px-1">
              {product.title}
            </Badge>
            <span className="flex justify-between items-baseline w-full">
              <p className="text-xs font-mono uppercase text-secondary">
                {product.price} SEK
              </p>

              <Badge
                variant="ghost"
                className="font-mono text-xs pt-0 px-1 hover:border-transparent hover:text-accent"
              >
                {product.size?.name}
              </Badge>
            </span>
          </CardDescription>
        )}

        {/* HOVER INFO OVERLAY (desktop only) */}
      </Card>
    </motion.div>
  );
}
