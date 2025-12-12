"use client";

import { useSite } from "@/app/context/SiteContext";
import ProductsGrid from "./ProductsGrid";
import SiteSelector from "../SiteSelector";

export default function ProductPageClient() {
  const { currentSite } = useSite();

  return (
    <div className={`min-h-screen`}>
      <SiteSelector />

      <ProductsGrid />
    </div>
  );
}
