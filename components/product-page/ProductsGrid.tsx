"use client";

import ProductCard from "./ProductCard";
import { useState, useEffect, useMemo } from "react";
import { Button, type buttonVariants } from "../ui/button";
import type { VariantProps } from "class-variance-authority";
import { useSite } from "@/context/SiteContext";
import { useProducts } from "@/context/ProductContext";
import { Fragment } from "react";
import ProductInlinePanel from "./ProductInlinePanel";
import { motion, type Variants, LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import LoaderJoJo from "../LoaderJoJo";
import { Input } from "../ui/input";

import { useWishlist } from "@/context/WishlistContext";

import { useProductFilters, type SortOption } from "@/hooks/useProductFilters";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { Cross1Icon } from "@radix-ui/react-icons";

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
  layoutIndex,
  setLayoutIndex,
}: {
  layouts: string[];
  layoutIndex: number;
  setLayoutIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const toggleCols = () => {
    setLayoutIndex((prev) => (prev + 1) % layouts.length);
  };

  return (
    <span onClick={toggleCols} className="cursor-pointer select-none">
      +/-
    </span>
  );
}

export default function ProductsGrid({}: {}) {
  const {
    products: allProducts,
    filterProducts,
    loading,
    error,
  } = useProducts();
  const searchParams = useSearchParams();

  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const inlinePanelRef = useRef<HTMLDivElement | null>(null);
  const { toggleItem } = useWishlist();
  const router = useRouter();
  const { currentSite, setCurrentSite, loading: siteLoading } = useSite();
  const [showTags, setShowTags] = useState(false);

  const [layoutIndex, setLayoutIndex] = useState<number>(2);
  const [showText, setShowText] = useState(true);
  const [showSort, setShowSort] = useState(false);

  const [modalProduct, setModalProduct] = useState<number | null>(null);
  const isLoading = loading || siteLoading;

  const [showFilters, setShowFilters] = useState(true);
  const [showCategory, setShowCategory] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const sortOptions: SortOption[] = [
    "latest",
    "oldest",
    "price-asc",
    "price-desc",
  ];

  const categories = [
    { id: 1, name: "accessories" },
    { id: 2, name: "bags" },
    { id: 3, name: "clothing" },
    { id: 4, name: "shoes" },
  ];

  const tags = [
    { id: 1, name: "y2k" },
    { id: 2, name: "summer" },
    { id: 3, name: "christmas" },
  ];

  const {
    filters,
    sortBy,
    setCategory,
    setTag,
    setSize,
    setSortBy,
    clearFilters,
  } = useProductFilters();

  const siteFiltered = useMemo(() => {
    if (currentSite === "sale") {
      return allProducts.filter((p) => p.for_sale === true);
    }

    if (currentSite === "rent") {
      return allProducts.filter((p) => p.for_sale === false);
    }

    return allProducts;
  }, [allProducts, currentSite]);

  // inside your filtering
  const fullyFiltered = useMemo(() => {
    return siteFiltered.filter((p) => {
      if (filters.category && p.category_id !== filters.category) return false;
      if (filters.tag && p.tag_id !== filters.tag) return false;
      if (filters.size && p.size_id !== filters.size) return false;

      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matches =
          p.title?.toLowerCase().includes(term) ||
          p.designer?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [siteFiltered, filters, debouncedSearch]);

  const sortedProducts = useMemo(() => {
    return [...fullyFiltered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      switch (sortBy) {
        case "latest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "price-asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc":
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0;
      }
    });
  }, [fullyFiltered, sortBy]);

  const activeFilters = useMemo(() => {
    const list: {
      key: string;
      label: string;
      onRemove?: () => void;
      onClick?: () => void;
    }[] = [];

    // CATEGORY
    if (filters.category !== undefined) {
      const cat = categories.find((c) => c.id === filters.category);
      if (cat) {
        list.push({
          key: `category-${cat.id}`,
          label: `${cat.name}`,
          onRemove: () => setCategory(undefined),
        });
      }
    }

    // TAG
    if (filters.tag !== undefined) {
      const tag = tags.find((t) => t.id === filters.tag);
      if (tag) {
        list.push({
          key: `tag-${tag.id}`,
          label: `#${tag.name}`,
          onRemove: () => setTag(undefined),
        });
      }
    }

    // SIZE
    if (filters.size !== undefined) {
      list.push({
        key: `size-${filters.size}`,
        label: `Size: ${filters.size}`,
        onRemove: () => setSize(undefined),
      });
    }

    // SORT — toggle
    if (sortBy) {
      const sortLabels: Record<string, string> = {
        latest: "Latest",
        oldest: "Oldest",
        "price-asc": "Price ↑",
        "price-desc": "Price ↓",
      };

      list.push({
        key: `sort-${sortBy}`,
        label: `Sort: ${sortLabels[sortBy] ?? sortBy}`,
        onClick: () => {
          const currentIndex = sortOptions.indexOf(sortBy);
          const nextIndex = (currentIndex + 1) % sortOptions.length;
          setSortBy(sortOptions[nextIndex]);
        },
      });
    }

    // SEARCH
    if (search.trim()) {
      list.push({
        key: "search",
        label: `Search: “${search}”`,
        onRemove: () => setSearch(""),
      });
    }

    return list;
  }, [
    filters.category,
    filters.tag,
    filters.size,
    sortBy,
    search,
    categories,
    tags,
    setCategory,
    setTag,
    setSize,
    setSortBy,
  ]);

  useEffect(() => {
    if (activeProduct && inlinePanelRef.current) {
      inlinePanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeProduct]);

  const handleShowText = () => {
    setShowText((prev) => !prev);
  };

  const layouts = [
    "grid-cols-4 lg:grid-cols-6 grid-rows-auto   auto-rows-fr",
    "grid-cols-3 lg:grid-cols-5 grid-rows-auto auto-rows-fr",
    "grid-cols-2 lg:grid-cols-4 grid-rows-auto auto-rows-fr",
    "grid-cols-1 lg:grid-cols-3 grid-rows-auto auto-rows-fr",
  ];

  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/products/")) {
      setActiveProduct(null);
    }
  }, [pathname]);

  function handleToggleActiveProduct(productId: number) {
    setModalProduct(null);
    setActiveProduct((prev) => (prev === productId ? null : productId));
  }

  const openModal = (id: number) => {
    setActiveProduct(null);
    setModalProduct(id);
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/products/${id}?${params.toString()}`);
  };

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  // Empty state
  if (sortedProducts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm opacity-60">
          No products available{" "}
          {currentSite === "sale" ? "for sale" : "for rent"}
        </div>
      </div>
    );
  }

  return (
    <>
      <LayoutGroup>
        <div className="mt-32 sticky top-0 z-40  bg-background px-1">
          <div className="h-1">
            <LoaderJoJo loading={isLoading} />
          </div>
        </div>
        <div
          className={` ${
            currentSite === "sale" ? "bg-background" : "bg-background"
          } relative w-full overflow-visible   `}
        >
          <div className="sticky top-1 z-40   w-full py-1 bg-background px-1 space-y-1 ">
            <div className=" flex justify-between items-baseline   w-full   ">
              <div className=" flex justify-evenly w-full space-x-1">
                <Button
                  className="font-display"
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters((v) => !v)}
                >
                  FILTERS
                </Button>
                {showFilters &&
                  activeFilters.map((filter) => (
                    <Button
                      key={filter.key}
                      size="sm"
                      variant="secondary"
                      className="whitespace-nowrap w-fit flex items-center gap-1 uppercase"
                      onClick={filter.onClick || filter.onRemove}
                    >
                      {filter.label}
                      {filter.onRemove && (
                        <Cross1Icon className="w-3 h-3 p-0.5 text-current" />
                      )}
                    </Button>
                  ))}

                <Input
                  className="h-6 bg-background text-sm border-l border-l-secondary px-1.5 w-full"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Button
                  variant={showText ? "secondary" : "outline"}
                  onClick={handleShowText}
                  size="icon"
                  className=""
                >
                  T
                </Button>
                <Button variant="outline" size="icon">
                  <ToggleGridColsButton
                    layouts={layouts}
                    layoutIndex={layoutIndex}
                    setLayoutIndex={setLayoutIndex}
                  />
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="bg-background gap-1 flex flex-wrap w-full">
                {/* CATEGORY */}
                <Button
                  className="font-display"
                  variant={showCategory ? "secondary" : "outline"}
                  onClick={() => setShowCategory((v) => !v)}
                >
                  Category
                </Button>
                {showCategory && (
                  <div className="flex gap-1 flex-wrap col-span-2">
                    <Button
                      className="font-display"
                      variant={
                        filters.category === undefined ? "secondary" : "outline"
                      }
                      onClick={() => setCategory(undefined)}
                    >
                      All
                    </Button>

                    {categories.map((cat) => (
                      <Button
                        className="font-display"
                        key={cat.id}
                        variant={
                          filters.category === cat.id ? "secondary" : "outline"
                        }
                        onClick={() => setCategory(cat.id)} // use ID now
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                )}
                <Button
                  className="font-display"
                  variant={showCategory ? "secondary" : "outline"}
                  onClick={() => setShowTags((v) => !v)}
                >
                  Tags
                </Button>
                {showTags && (
                  <div className="flex gap-1 flex-wrap col-span-1">
                    {tags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={
                          filters.tag === tag.id ? "secondary" : "outline"
                        }
                        onClick={() => setTag(tag.id)} // use ID now
                      >
                        #{tag.name}
                      </Button>
                    ))}
                  </div>
                )}
                <Button
                  className="font-display"
                  variant={showSort ? "secondary" : "outline"}
                  onClick={() => setShowSort((v) => !v)}
                >
                  Sort By
                </Button>
                {/* SORT */}
                {showSort && (
                  <div className="flex gap-1 col-span-1">
                    <Button
                      variant={sortBy === "latest" ? "secondary" : "outline"}
                      onClick={() => setSortBy("latest")}
                    >
                      Latest
                    </Button>

                    <Button
                      variant={sortBy === "price-asc" ? "secondary" : "outline"}
                      onClick={() => setSortBy("price-asc")}
                      className="font-display"
                    >
                      Price (low to high)
                    </Button>
                    <Button
                      variant={
                        sortBy === "price-desc" ? "secondary" : "outline"
                      }
                      onClick={() => setSortBy("price-desc")}
                      className="font-display"
                    >
                      Price (high to low)
                    </Button>
                  </div>
                )}
                <Button onClick={clearFilters} variant="outline">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          <motion.div
            key={`${currentSite}-${layoutIndex}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={` grid  ${
              layouts[layoutIndex]
            } gap-x-1.5 gap-y-1.5 relative pb-1 px-1 ${
              currentSite === "sale" ? "bg-background" : "bg-background"
            }`}
          >
            {sortedProducts.map((product) => (
              <Fragment key={product.id}>
                <motion.div layout layoutId={`product-${product.id}`}>
                  <ProductCard
                    showText={showText}
                    setShowText={setShowText}
                    product={product}
                    activeProduct={activeProduct}
                    handleToggleActiveProduct={(id) =>
                      handleToggleActiveProduct(id as number)
                    }
                    openModal={openModal}
                  />
                </motion.div>

                {activeProduct === product.id && (
                  <ProductInlinePanel
                    ref={inlinePanelRef}
                    product={product}
                    mode="view"
                    onClose={() => setActiveProduct(null)}
                    handleToggleActiveProduct={(id) =>
                      handleToggleActiveProduct(id as number)
                    }
                  />
                )}
              </Fragment>
            ))}
          </motion.div>
        </div>
      </LayoutGroup>
    </>
  );
}
