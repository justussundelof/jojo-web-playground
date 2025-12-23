"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoaderJoJo from "@/components/LoaderJoJo";

export type SiteType = "sale" | "rent" | "neutral";

interface SiteContextProps {
  currentSite: SiteType;
  setCurrentSite: (site: SiteType) => void;
  toggleSite: () => void;
  loading: boolean;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const siteFromUrl = searchParams.get("site") as SiteType | null;

  const currentSite: SiteType = useMemo(() => {
    return siteFromUrl ?? "neutral";
  }, [siteFromUrl]);

  const [loading, setLoading] = React.useState(false);

  const updateSiteInUrl = useCallback(
    (site: SiteType) => {
      const params = new URLSearchParams(searchParams.toString());

      if (site === "neutral") {
        params.delete("site");
      } else {
        params.set("site", site);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setCurrentSite = (site: SiteType) => {
    setLoading(true);
    updateSiteInUrl(site);
  };

  const toggleSite = () => {
    setLoading(true);
    updateSiteInUrl(currentSite === "sale" ? "rent" : "sale");
  };

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <SiteContext.Provider
      value={{ currentSite, setCurrentSite, toggleSite, loading }}
    >
      {loading && <LoaderJoJo loading />}
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
