"use client";

import { Card, CardAction, CardContent, CardDescription } from "../ui/card";
import Image from "next/image";
import type { Product } from "@/types/product";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import {
  HeartIcon,
  HeartFilledIcon,
  EnterFullScreenIcon,
  SizeIcon,
} from "@radix-ui/react-icons";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  showText: boolean;
  setShowText: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleActiveProduct: (productId: number | null) => void;
  activeProduct: number | null;
  openModal: (productId: number) => void;
}

export default function ProductCard({
  product,
  showText,

  handleToggleActiveProduct,
}: ProductCardProps) {
  const productId = product.id ?? 0;

  const imageUrl = product.img_url
    ? optimizeCloudinaryImage(product.img_url, {
        width: 800,
        height: 1066,
        quality: "auto",
        crop: "fill",
        gravity: "auto",
      })
    : null;

  const router = useRouter();

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/product/${productId}`);
  };

  const isOutOfStock = !product.in_stock;
  const { toggleItem, isInWishlist } = useWishlist();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      productId,
      name: product.title || "Product",
      price: product.price || 0,
      image: product.img_url || "",
    });
  };

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
          <div onClick={openModal} className="relative w-full aspect-3/4">
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

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-0 left-0 z-20 aspect-square h-p  "
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActiveProduct(productId);
              }}
            >
              <SizeIcon />
            </Button>
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
            <span className="flex justify-between items-center w-full">
              <Badge
                variant="secondary"
                className="font-mono pt-0 px-1 cursor-pointer"
                onClick={openModal}
              >
                {product.title}
              </Badge>

              <Button size="icon" variant="link" onClick={handleWishlistClick}>
                {isInWishlist(productId) ? (
                  <HeartFilledIcon className="text-secondary" />
                ) : (
                  <HeartIcon />
                )}
              </Button>
            </span>
            <span className="flex justify-between items-baseline w-ful pr-">
              <p className="text-xs font-mono uppercase text-secondary">
                {product.price} SEK
              </p>

              <Badge
                variant="ghost"
                className="font-mono text-xs hover:border-transparent hover:text-accent"
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
