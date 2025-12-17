"use client";

import { useSite } from "@/app/context/SiteContext";
import ProductsGrid from "./ProductsGrid";
import SiteSelector from "../SiteSelector";
import { useState, useEffect } from "react";
import LoaderGIF from "../LoaderGIF";

export default function ProductPageClient({}: {}) {
  const { currentSite } = useSite();

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (currentSite !== "neutral") {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [currentSite]);

  return (
    <div className={`min-h-screen bg-background overflow-hidden  `}>
      <section
        className={`${
          currentSite === "neutral" ? "px-0 block   h-screen" : "hidden "
        }  `}
      >
        <SiteSelector />
      </section>

      {currentSite === "neutral" ? null : showLoader ? (
        <LoaderGIF />
      ) : (
        <ProductsGrid />
      )}
    </div>
  );
}
