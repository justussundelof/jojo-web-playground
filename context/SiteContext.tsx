"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import LoaderGIF from "@/components/LoaderGIF"; // adjust path

export type SiteType = "sale" | "rent" | "neutral";

interface SiteContextProps {
  currentSite: SiteType;
  setCurrentSite: (site: SiteType) => void;
  toggleSite: () => void;
  loading: boolean;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [currentSite, setCurrentSite] = useState<SiteType>("neutral");
  const [loading, setLoading] = useState(false);

  const toggleSite = () => {
    setLoading(true);
    setCurrentSite((prev) => (prev === "sale" ? "rent" : "sale"));
  };

  // Whenever currentSite changes, stop loading after a short delay
  useEffect(() => {
    if (currentSite !== "neutral") {
      const timer = setTimeout(() => setLoading(false), 500); // adjust duration as needed
      return () => clearTimeout(timer);
    }
  }, [currentSite]);

  return (
    <SiteContext.Provider
      value={{ currentSite, setCurrentSite, toggleSite, loading }}
    >
      {loading && <LoaderGIF />}
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = (): SiteContextProps => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
};
