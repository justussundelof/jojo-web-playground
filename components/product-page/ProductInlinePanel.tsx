"use client";

import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { Button } from "../ui/button";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import Image from "next/image";
import { forwardRef } from "react";
import { Badge } from "../ui/badge";
import {
  Cross1Icon,
  SizeIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";

interface ProductInlinePanelProps {
  product: Product;
  mode?: "view" | "edit";
  onClose: () => void;
  handleToggleActiveProduct: (productId: number) => void;
}

const ProductInlinePanel = forwardRef<HTMLDivElement, ProductInlinePanelProps>(
  ({ product, mode = "view", onClose, handleToggleActiveProduct }, ref) => {
    const router = useRouter();

    if (!product.id) return null;
    const productId = product.id;

    const { toggleItem, isInWishlist } = useWishlist();
    const isWished = isInWishlist(productId);

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

    const imageUrl = product.img_url
      ? optimizeCloudinaryImage(product.img_url, {
          width: 800,
          height: 1066,
          quality: "auto",
          crop: "fill",
          gravity: "auto",
        })
      : null;

    const openModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/product/${productId}`);
    };

    return (
      <motion.div
        ref={ref}
        layout
        layoutId={`product-${productId}`}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="
        col-span-2
        row-span-2
        bg-background
        border-b border-secondary
        overflow-hidden
        relative
        flex
      "
      >
        {/* Close inline panel */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-0 left-0 z-20 bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <SizeIcon />
        </Button>

        {/* IMAGE */}
        <div className="relative w-full h-full">
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

          {/* INFO BAR */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col  justify-between lg:items-baseline bg-background px-0 py-1">
            <span className="flex justify-between items-center w-full">
              <Badge
                variant="secondary"
                className="font-mono pt-0 px-1 cursor-pointer"
                onClick={openModal}
              >
                {product.title}
              </Badge>

              <Button
                variant="link"
                size="icon"
                className=" "
                onClick={handleWishlistClick}
              >
                {isWished ? (
                  <HeartFilledIcon className=" text-secondary" />
                ) : (
                  <HeartIcon className=" " />
                )}
              </Button>
            </span>
            <span className="flex justify-between items-baseline w-full pr-1">
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
          </div>
        </div>
      </motion.div>
    );
  }
);

ProductInlinePanel.displayName = "ProductInlinePanel";

export default ProductInlinePanel;
