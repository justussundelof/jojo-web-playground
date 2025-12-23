"use client";

import { useSite } from "@/context/SiteContext";
import ProductsGrid from "./ProductsGrid";
import SiteSelector from "./SiteSelector";
import LoaderJoJo from "../LoaderJoJo";
import FloatingNav from "../Navigation-header/FloatingNav";

export default function ProductPageClient() {
  const { currentSite, loading } = useSite();

  return (
    <div className="bg-background relative">
      <section>
        <SiteSelector />
      </section>

      {currentSite === "neutral" && null}

      {currentSite !== "neutral" && loading && <LoaderJoJo loading={loading} />}

      {currentSite !== "neutral" && !loading && <ProductsGrid />}
    </div>
  );
}
