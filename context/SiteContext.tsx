"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useState,
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

  // ✅ LOCAL STATE is the source of truth
  const [currentSite, setCurrentSiteState] = useState<SiteType>(
    siteFromUrl ?? "neutral"
  );

  const [loading, setLoading] = useState(false);

  const [pendingSite, setPendingSite] = useState<SiteType | null>(null);

  const toggleSite = () => {
    const next = currentSite === "sale" ? "rent" : "sale";
    setCurrentSiteState(next); // update UI immediately
    setPendingSite(next); // queue URL update
  };

  // sync URL in background
  useEffect(() => {
    if (pendingSite && pendingSite !== siteFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (pendingSite === "neutral") params.delete("site");
      else params.set("site", pendingSite);

      router.replace(`?${params.toString()}`, { scroll: false });
      setPendingSite(null);
    }
  }, [pendingSite, searchParams]);

  // ✅ Sync FROM url (back/forward, external nav)
  useEffect(() => {
    if (siteFromUrl && siteFromUrl !== currentSite) {
      setCurrentSiteState(siteFromUrl);
    }
    if (!siteFromUrl && currentSite !== "neutral") {
      setCurrentSiteState("neutral");
    }
  }, [siteFromUrl]);

  const updateSiteInUrl = useCallback(
    (site: SiteType) => {
      const params = new URLSearchParams(searchParams.toString());

      if (site === "neutral") {
        params.delete("site");
      } else {
        params.set("site", site);
      }

      const next = params.toString();
      const current = searchParams.toString();

      if (next !== current) {
        router.replace(`?${next}`, { scroll: false });
      }
    },
    [router, searchParams]
  );

  // ✅ UI FIRST, URL SECOND
  const setCurrentSite = (site: SiteType) => {
    setLoading(true);
    setCurrentSiteState(site);

    requestAnimationFrame(() => {
      updateSiteInUrl(site);
    });
  };

  // fake loading window for animation
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <SiteContext.Provider
      value={{ currentSite, setCurrentSite, toggleSite, loading }}
    >
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
