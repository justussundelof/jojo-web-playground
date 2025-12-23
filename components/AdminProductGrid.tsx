"use client";

import Link from "next/link";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";
import type { Product } from "@/types/product";
import ProductCard from "./product-page/ProductCard";
import { useState, type ComponentPropsWithoutRef } from "react";
import ProductForm from "@/components/ProductForm";
import { Button, type buttonVariants } from "./ui/button";
import type { VariantProps } from "class-variance-authority";
import { motion, type Variants } from "framer-motion";

interface ProductGridProps {
  products: Product[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // shorter delay between each card
      delayChildren: 0.2, // initial delay before first card
    },
  },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 }, // slide in from left + fade
  visible: {
    opacity: 1,

    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function ToggleGridColsButton({
  layouts,
  setLayoutIndex,
  buttonText,
}: {
  layouts: string[];
  buttonText: string;
  setLayoutIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const toggleCols = () => {
    setLayoutIndex((prev) => (prev + 1) % layouts.length);
  };

  return (
    <Button onClick={toggleCols} size="sm" variant="link">
      {buttonText}
    </Button>
  );
}

export default function AdminProductGrid({ products }: ProductGridProps) {
  const [openForm, setOpenForm] = useState(false);
  const toggleForm = () => setOpenForm(!openForm);

  const [layoutIndex, setLayoutIndex] = useState<number>(0);
  const [showText, setShowText] = useState(false);

  const layouts = [
    "grid-cols-4 lg:grid-cols-8 grid-rows-auto",
    "grid-cols-2 lg:grid-cols-6 grid-rows-auto",
    "grid-cols-1 lg:grid-cols-4 grid-rows-auto",
  ];

  return (
    <div className="mt-10 relative w-full pl-1 pr-1  lg:pl-10 pt-1 pb-1 ">
      {openForm && <ProductForm toggleForm={toggleForm} mode="create" />}

      <motion.div
        key={`-${layoutIndex}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={` grid   ${layouts[layoutIndex]} gap-x-1.5 gap-y-1.5 relative`}
      >
        {products.map((product, index) => {
          // Optimize image URL if available
          const imageUrl = product.img_url
            ? optimizeCloudinaryImage(product.img_url, {
                width: 600,
                height: 800,
                quality: "auto",
                crop: "fill",
                gravity: "auto",
              })
            : null;

          return (
            <motion.div
              className="relative z-10 "
              key={product.id}
              variants={cardVariants}
            >
              <Link
                href={`/admin/product/${product.id}`}
                className="group cursor-pointer"
              >
                <ProductCard
                  product={product}
                  showText={showText}
                  setShowText={setShowText}
                />{" "}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
