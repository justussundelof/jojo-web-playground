"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type SiteType = "sale" | "rent" | "neutral";

interface SiteContextProps {
  currentSite: SiteType;
  setCurrentSite: (site: SiteType) => void;
  toggleSite: () => void;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [currentSite, setCurrentSite] = useState<SiteType>("neutral");

  const toggleSite = () => {
    setCurrentSite((prev) => (prev === "sale" ? "rent" : "sale"));
  };

  return (
    <SiteContext.Provider value={{ currentSite, setCurrentSite, toggleSite }}>
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
