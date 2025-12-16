'use client'

import { Card, CardContent, CardDescription } from "../ui/card";
import Image from "next/image";
import type { Article } from "@/types/database";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import { useCart } from "@/context/CartContext";
import { Button } from "../ui/button";

interface ProductCardProps {
  product: Article;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart, getItemQuantity } = useCart();
  const productPrice = `${product.price || 0} SEK`;
  const aspectClass = "aspect-[3/4]";

  // Optimize image URL if available
  const imageUrl = product.img_url
    ? optimizeCloudinaryImage(product.img_url, {
        width: 800,
        height: 1066,
        quality: "auto",
        crop: "fill",
        gravity: "auto",
      })
    : null;

  const handleAddToCart = () => {
    if (product.id && product.title && product.price) {
      addItem({
        productId: product.id,
        name: product.title,
        price: product.price,
        quantity: 1,
        image: imageUrl || '/placeholder.png',
      });
    }
  };

  return (
    <Card className={`w-full `}>
      <CardContent className="p-0">
        <div className={`relative w-full ${aspectClass} bg-gray-100`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title || "Product"}
              fill
              className="object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm opacity-40">
              NO IMAGE
            </div>
          )}
        </div>
      </CardContent>
      <CardDescription className="py-3 px-1.5 space-y-1.5">
        <h3 className="font-bold truncate w-2/3">{product.title || "Untitled"}</h3>
        <h4 className="flex w-full justify-between items-baseline font-mono ">
          {productPrice}
        </h4>
        <Button
          onClick={handleAddToCart}
          size="sm"
          variant={isInCart(product.id || 0) ? "outline" : "default"}
          className="w-full mt-2"
        >
          {isInCart(product.id || 0)
            ? `In Cart (${getItemQuantity(product.id || 0)})`
            : 'Add to Cart'}
        </Button>
      </CardDescription>
    </Card>
  );
}
