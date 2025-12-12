"use client";

import ProductCard from "./ProductCard";
import { useState } from "react";
import { Button, type buttonVariants } from "../ui/button";
import type { VariantProps } from "class-variance-authority";
import { useSite } from "@/app/context/SiteContext";
import { useProducts } from "@/context/ProductContext";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

function ToggleGridColsButton({
  buttonText,
  size = "sm",
  variant = "ghost",
  layouts,
  setLayoutIndex,
}: {
  buttonText: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  layouts: string[];
  layoutIndex: number;
  setLayoutIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const toggleCols = () => {
    setLayoutIndex((prev) => (prev + 1) % layouts.length);
  };

  return (
    <Button onClick={toggleCols} size={size} variant={variant}>
      {buttonText}
    </Button>
  );
}

export default function ProductsGrid({}: {}) {
  const { currentSite } = useSite();
  const { products: allProducts, loading, error } = useProducts();

  // Filter products based on current site (sale or rent)
  const products = allProducts.filter((product) => {
    if (currentSite === "sale") {
      return product.for_sale === true;
    } else {
      return product.for_sale === false;
    }
  });

  const [layoutIndex, setLayoutIndex] = useState<number>(1);

  const layouts = [
    "grid-cols-4 lg:grid-cols-8 grid-rows-auto",
    "grid-cols-2 lg:grid-cols-6 grid-rows-auto",
    "grid-cols-1 lg:grid-cols-4 grid-rows-auto",
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm opacity-60">Loading products...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm opacity-60">
          No products available {currentSite === "sale" ? "for sale" : "for rent"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* FILTER BUTTONS */}
      <div className={`z-10 sticky left-0 top-8 bg-white`}>
        <div className="flex justify-between items-start font-mono text-xs gap-3 w-full">
          <span className="flex items-start font-mono text-xs gap-3">
            <Button size="sm" variant="ghost">
              FILTER
            </Button>
            <Button size="sm" variant="ghost">
              Latest Added [x]
            </Button>
          </span>
          <ToggleGridColsButton
            layouts={layouts}
            layoutIndex={layoutIndex}
            setLayoutIndex={setLayoutIndex}
            buttonText="[+/-]"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      <div className="px-3">
        {/* GRID */}
        <div className={`grid ${layouts[layoutIndex]} `}>
          {products.map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}

          <div className="h-screen"></div>
        </div>
      </div>
    </div>
  );
}
