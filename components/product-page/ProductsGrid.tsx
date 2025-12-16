"use client";

import ProductCard from "./ProductCard";
import { useState, useMemo } from "react";
import { Button, type buttonVariants } from "../ui/button";
import type { VariantProps } from "class-variance-authority";
import { useSite } from "@/app/context/SiteContext";
import { useProducts } from "@/context/ProductContext";
import { Input } from "../ui/input";

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

  const [layoutIndex, setLayoutIndex] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "newest">("newest");

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.category?.name).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allProducts]);

  // Filter and sort products
  const products = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      // Filter by site (sale or rent)
      if (currentSite === "sale") {
        if (product.for_sale !== true) return false;
      } else {
        if (product.for_sale !== false) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = product.title?.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Filter by category
      if (selectedCategory && product.category?.name !== selectedCategory) {
        return false;
      }

      // Filter by price range
      if (priceMin && product.price && product.price < Number(priceMin)) {
        return false;
      }
      if (priceMax && product.price && product.price > Number(priceMax)) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, currentSite, searchQuery, selectedCategory, priceMin, priceMax, sortBy]);

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
      {/* FILTER CONTROLS */}
      <div className={`z-10 sticky left-0 top-8 bg-white pb-4`}>
        <div className="px-3 space-y-3">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-mono text-xs"
          />

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2 items-center font-mono text-xs">
            {/* Categories */}
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-1.5 border border-black text-xs font-mono"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <Input
              type="number"
              placeholder="Min Price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-24 text-xs font-mono"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max Price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-24 text-xs font-mono"
            />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-black text-xs font-mono"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || priceMin || priceMax) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setPriceMin("");
                  setPriceMax("");
                }}
              >
                Clear
              </Button>
            )}

            {/* Grid Toggle */}
            <div className="ml-auto">
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

          {/* Result Count */}
          <div className="text-xs opacity-60">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </div>
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
