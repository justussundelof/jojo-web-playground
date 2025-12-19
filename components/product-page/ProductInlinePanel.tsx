import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Button } from "../ui/button";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import Image from "next/image";
import Link from "next/link";
import { forwardRef } from "react";
import { Badge } from "../ui/badge";

interface ProductInlinePanelProps {
  product: Product;
  mode?: "view" | "edit";
  onClose: () => void;
}

const ProductInlinePanel = forwardRef<HTMLDivElement, ProductInlinePanelProps>(
  ({ product, mode = "view", onClose }, ref) => {
    const imageUrl = product.img_url
      ? optimizeCloudinaryImage(product.img_url, {
          width: 800,
          height: 1066,
          quality: "auto",
          crop: "fill",
          gravity: "auto",
        })
      : null;

    return (
      <motion.div
        ref={ref} // forward the ref
        layout
        layoutId={`product-${product.id}`}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="
          col-span-2
          row-span-2
          bg-background
     border-b-secondary border-b
          overflow-hidden
          flex
          relative
        "
      >
        <Button
          onClick={onClose}
          className="absolute top-2 left-2 z-10 "
          variant="link"
          size="sm"
        >
          Close
        </Button>

        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <div className="flex flex-col w-full h-full">
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
              <div className="absolute bottom-0 left-0 right-0 flex flex-col lg:flex-row justify-between lg:items-baseline bg-background px-0 py-1">
                <Badge variant="secondary" className=" font-mono pt-0 px-0.5">
                  {product.title}
                </Badge>
                <p className="text-xs font-mono uppercase text-secondary">
                  {product.price} SEK
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);

ProductInlinePanel.displayName = "ProductInlinePanel"; // Needed for forwardRef

export default ProductInlinePanel;
