"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import {
  HeartIcon,
  HeartFilledIcon,
  Share2Icon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useProducts } from "@/context/ProductContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";

interface ProductModalProps {
  id: string;
  mode?: "view" | "edit" | null;
}

export default function ProductModalClient({
  id,
  mode = "view",
}: ProductModalProps) {
  const router = useRouter();
  const { products } = useProducts();
  const {
    isInWishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const { addItem: addToCart, isInCart } = useCart();

  const productId = Number(id);
  const product = products.find((p) => p.id === productId);
  const isWished = isInWishlist(productId);
  const inCart = isInCart(productId);

  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product?.img_url || "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!product) return <div className="fixed inset-0 z-40 bg-background/50" />;

  const images = Array(4).fill(product.img_url); // repeat main image 4x

  const toggleWishlist = () => {
    if (!product) return;
    if (isWished) removeFromWishlist(productId);
    else
      addToWishlist({
        productId,
        name: product.title || "Product",
        price: product.price || 0,
        image: product.img_url || "",
      });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId,
      name: product.title || "Product",
      price: product.price || 0,
      image: product.img_url || "",
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const closeModal = () => router.back();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-background flex flex-col items-start justify-start "
    >
      {/* HEADER */}
      <div className="fixed top-0 z-50 left-0 w-full flex items-center justify-between p-4">
        <Button
          variant="secondary"
          className="bg-transparent text-secondary border-transparent"
          size="icon"
          onClick={closeModal}
        >
          <Cross1Icon />
        </Button>
        <span className="hidden lg:flex items-baseline space-x-1 text-xs text-secondary font-display  ">
          <Badge className="font-display uppercase" variant="ghost">
            {product.category?.name}
          </Badge>
          /
          <Badge className="font-display uppercase" variant="ghost">
            {product.title}
          </Badge>
        </span>
      </div>

      {mode === "edit" ? (
        <ProductForm
          mode="edit"
          initialProduct={product}
          closeModal={closeModal}
        />
      ) : (
        <>
          <div className="grid grid-cols-6 w-full gap-4  h-[calc(100vh-0rem)] lg:h-[calc(100vh-0rem)]  px-2 pt-0 pb-2  ">
            {/* HERO IMAGE */}
            <div className="col-start-2 col-span-4 lg:col-start-3 lg:col-span-2 relative w-full h-full   flex items-center justify-center pb-4  ">
              <div className=" relative h-[50vh] lg:h-[calc(100vh-1.5rem)] aspect-3/4 ">
                <Image
                  src={optimizeCloudinaryImage(selectedImage || "", {
                    width: 1200,
                    height: 1600,
                    quality: "auto",
                    crop: "fill",
                    gravity: "auto",
                  })}
                  alt={"Product image"}
                  fill
                  className="object-cover "
                />
              </div>
            </div>

            {/* TEXT BOX MOBILE */}
            <div className="col-start-1 col-span-6 flex lg:hidden flex-col w-full px-0 pb-2 space-y-2 ">
              <div className="px-2 col-start-1 col-span-1 flex flex-col items-start justify-start  ">
                <h1 className="text-2xl font-display text-secondary mb-2">
                  {product.title}
                </h1>

                <p className="text-sm leading-snug text-secondary pb-4 font-extended font-light  max-w-sm">
                  Cropped, loose fitting, parka featuring seven pockets and
                  multi-function hood design. OTTO 958 rubber injected velcro
                  patch for multiple placement options. Iridescent "O" motif in
                  custom eight point pattern on back side. Custom overspray
                  "netting" motif on various locations. Made from 100% Bawełna
                  Cotton Ripstop.
                </p>
                <div className="flex flex-col items-start justify-start text-xs py-2 border-t border-t-secondary border-b border-b-secondary w-full mb-4">
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Brand/Designer:{" "}
                    <strong className="font-normal">{product.designer}</strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Size:{" "}
                    <strong className="font-normal">
                      {product.size?.name}
                    </strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Measurements:
                    <strong className="font-normal">-</strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-1  font-mono font-bold text-secondary uppercase w-full">
                    Price:{" "}
                    <strong className="font-normal">{product.price}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-start space-x-2 w-full">
                  <Button
                    variant="secondary"
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="max-w-[90%] w-full"
                  >
                    {addedToCart
                      ? "Added to cart!"
                      : product.in_stock
                      ? "Add to cart"
                      : "Out of stock"}
                  </Button>
                  <Button
                    size="default"
                    variant={isWished ? "secondary" : "outline"}
                    className="aspect-square p-1"
                    onClick={toggleWishlist}
                  >
                    <HeartFilledIcon className=" w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* TEXT BOX DESKTOP */}
            <div className="hidden lg:grid relative lg:absolute top-0 left-0 w-full h-screen grid-cols-4 items-center justify-center z-40 p-1   ">
              <div className="px-2 col-start-1 col-span-1 flex flex-col items-start justify-start  ">
                <h1 className="text-2xl font-display text-secondary mb-2">
                  {product.title}
                </h1>

                <p className="text-sm leading-snug text-secondary pb-4 font-extended font-light  max-w-sm">
                  Cropped, loose fitting, parka featuring seven pockets and
                  multi-function hood design. OTTO 958 rubber injected velcro
                  patch for multiple placement options. Iridescent "O" motif in
                  custom eight point pattern on back side. Custom overspray
                  "netting" motif on various locations. Made from 100% Bawełna
                  Cotton Ripstop.
                </p>
                <div className="flex flex-col items-start justify-start text-xs py-1 border-t border-t-secondary border-b border-b-secondary w-full mb-4">
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Brand/Designer:{" "}
                    <strong className="font-normal">{product.designer}</strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Size:{" "}
                    <strong className="font-normal">
                      {product.size?.name}
                    </strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-2  font-mono font-bold text-secondary uppercase w-full">
                    Measurements:
                    <strong className="font-normal">-</strong>
                  </span>
                  <span className="flex justify-start items-baseline gap-x-1  font-mono font-bold text-secondary uppercase w-full">
                    Price:{" "}
                    <strong className="font-normal">{product.price}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-start space-x-2 py-1 w-full">
                  <Button
                    variant="secondary"
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="max-w-64 w-full"
                  >
                    {addedToCart
                      ? "Added to cart!"
                      : product.in_stock
                      ? "Add to cart"
                      : "Out of stock"}
                  </Button>
                  <Button
                    size="default"
                    variant={isWished ? "secondary" : "outline"}
                    className="aspect-square p-1"
                    onClick={toggleWishlist}
                  >
                    <HeartFilledIcon className=" w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-6 grid-rows-[auto_2fr_1fr] w-full gap-1 lg:h-screen p-4 ">
            {/* ADDITIONAL IMAGES */}
            <div className="col-span-6 row-start-2 row-span-2 grid grid-cols-2 lg:grid-cols-6 gap-1 w-full h-full pb-4 ">
              {images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-full aspect-3/4 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={optimizeCloudinaryImage(img, {
                      width: 800,
                      height: 1066,
                      quality: "auto",
                      crop: "fill",
                      gravity: "auto",
                    })}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="col-span-6 row-start-4 grid grid-cols-2 w-full gap-x-1 gap-y-4">
              <div className="col-span-2 border-t border-secondary flex lg:grid lg:grid-cols-6 gap-2 p-1">
                <Button
                  variant="link"
                  className="lg:col-start-1 font-mono text-xs w-min"
                >
                  Shipping & Returns
                </Button>
                <Button
                  variant="link"
                  className=" lg:col-start-3 font-mono text-xs w-min"
                >
                  Terms & Conditions
                </Button>
              </div>

              <div className="col-span-2 flex flex-col gap-2 overflow-x-auto ">
                <h4 className="font-display text-xl text-secondary  px-2">
                  Related Items
                </h4>
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-1 w-full">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-square cursor-pointer border border-transparent"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={optimizeCloudinaryImage(img, {
                          width: 80,
                          height: 80,
                          quality: "auto",
                          crop: "fill",
                          gravity: "auto",
                        })}
                        alt={`Related ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
