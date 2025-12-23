"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import type { Article } from "@/types/database";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AdminEditProductModalProps {
  params: { id: string }; // <-- Not a Promise
}

export default function AdminEditProductModal({
  params,
}: AdminEditProductModalProps) {
  const [product, setProduct] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const closeModal = () => {
    router.push("/admin");
  };

  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("article")
        .select(
          `
          *,
          category:categories!fk_article_category(id, name, slug, parent_id),
          tag:tags!fk_article_tag(id, name, slug),
          size:sizes!fk_article_size(id, name, slug)
        `
        )
        .eq("id", params.id)
        .single();

      if (fetchError || !data) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [params.id, router]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 inset-0 z-30 grid grid-cols-12 items-start justify-center overflow-y-auto shadow-2xl min-h-screen w-full"
    >
      <div
        className="absolute inset-0 bg-background/50 w-full z-0 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      />

      <div
        className="col-start-2 col-span-11 relative z-40 mx-0 shadow-xl overflow-y-auto flex flex-col lg:flex-row items-center justify-center bg-background h-full w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <ProductForm
          mode="edit"
          initialProduct={product || undefined}
          closeModal={closeModal}
        />
      </div>
    </motion.div>
  );
}
