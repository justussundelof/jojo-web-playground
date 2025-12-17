"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import { HeartIcon, Share2Icon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { useProducts } from "@/context/ProductContext";
import ProductForm from "../ProductForm";
import { useEffect, useState } from "react";

interface ProductModalProps {
  id: string;
  mode?: "view" | "edit";
}

export default function ProductModalClient({
  id,
  mode = "view",
}: ProductModalProps) {
  const router = useRouter();
  const { products, updateProduct } = useProducts();

  const productId = Number(id);
  const product = products.find((p) => p.id === productId);

  // Hooks are always called
  const [title, setTitle] = useState(product?.title ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? "");
  const [imgUrl, setImgUrl] = useState(product?.img_url ?? "");

  const toggleForm = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Guard in JSX only
  if (!product) {
    return <div className="fixed inset-0 z-40 bg-background/50" />;
  }

  const imageOptimized = imgUrl
    ? optimizeCloudinaryImage(imgUrl, {
        width: 800,
        height: 1066,
        quality: "auto",
        crop: "fill",
        gravity: "auto",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-background/50 h-screen"
      onClick={toggleForm}
    >
      <div
        className="relative mx-auto  w-full  bg-background shadow-xl flex flex-row items-start justify-center h-full p-1"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "edit" ? (
          <ProductForm
            mode="edit"
            initialProduct={product}
            toggleForm={toggleForm}
          />
        ) : (
          <div className=" grid grid-cols-4 items-center justify-center w-full h-full  gap-x-1">
            <div className="col-span-2 flex flex-row items-center justify-between ">
              <div className="flex flex-col justify-center items-start mt-4 gap-2 w-full">
                <h1>{product.title}</h1>
                <h2 className="text-sm mb-3">{product.price} SEK</h2>
                <p className="text-sm">{product.description} blablbla</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <Button variant="ghost" size="icon">
                  <HeartIcon />
                </Button>
                <Button variant="ghost" size="icon" className="block lg:hidden">
                  <Share2Icon />
                </Button>
              </div>
            </div>
            <div className="col-start-1 col-span-2 flex flex-col justify-center items-start mt-4 gap-2 ">
              <Button className="w-full" size="lg">
                Add to cart
              </Button>
            </div>

            <div className=" col-start-3 col-span-2 flex flex-col overflow-y-scroll w-full items-start justify-start">
              <div className="relative w-full aspect-3/4 h-auto">
                {imageOptimized ? (
                  <Image
                    src={imageOptimized}
                    alt={title || "Product image"}
                    fill
                    className="object-cover object-top w-full"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm opacity-40">
                    NO IMAGE
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
