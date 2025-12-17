"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { Article } from "@/types/database";

interface ProductContextType {
  products: Article[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  filterProducts: (filters: ProductFilters) => Article[];
  updateProduct: (updated: Article) => Promise<void>;
}

interface ProductFilters {
  category?: string;
  tag?: string;
  size?: string;
  inStock?: boolean;
  forSale?: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("article")
        .select(
          `
          *,
          category:categories!fk_article_category(id, name, slug),
          size:sizes!fk_article_size(id, name, slug),
          tag:tags!fk_article_tag(id, name, slug)
        `
        )
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const productsWithImages = await Promise.all(
        (data || []).map(async (product) => {
          const { data: images } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("article_id", product.id)
            .eq("is_primary", true)
            .single();

          return {
            ...product,
            img_url: images?.image_url || product.img_url,
          };
        })
      );

      setProducts(productsWithImages);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const filterProducts = (filters: ProductFilters): Article[] => {
    return products.filter((product) => {
      if (filters.category && product.category?.slug !== filters.category) {
        return false;
      }
      if (filters.tag && product.tag?.slug !== filters.tag) {
        return false;
      }
      if (filters.size && product.size?.slug !== filters.size) {
        return false;
      }
      if (
        filters.inStock !== undefined &&
        product.in_stock !== filters.inStock
      ) {
        return false;
      }
      if (
        filters.forSale !== undefined &&
        product.for_sale !== filters.forSale
      ) {
        return false;
      }
      return true;
    });
  };

  // New: updateProduct
  const updateProduct = async (updated: Article) => {
    try {
      setLoading(true);
      setError(null);

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("article")
        .update({
          title: updated.title,
          description: updated.description,
          price: updated.price,
          img_url: updated.img_url,
          in_stock: updated.in_stock,
          for_sale: updated.for_sale,
          category: updated.category?.id,
          size: updated.size?.id,
          tag: updated.tag?.id,
        })
        .eq("id", updated.id);

      if (updateError) throw updateError;

      // Update locally
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
    } catch (err) {
      console.error("Failed to update product:", err);
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    filterProducts,
    updateProduct,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

// Custom hook
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
