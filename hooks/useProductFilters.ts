"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOption =
  | "latest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | null;

export type ProductFilters = {
  category?: number;
  tag?: number;
  size?: number;
  search?: string;
};

export function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseNumber = (v: string | null): number | undefined => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const filters = useMemo<ProductFilters>(
    () => ({
      category: parseNumber(searchParams.get("category")),
      tag: parseNumber(searchParams.get("tag")),
      size: parseNumber(searchParams.get("size")),
      search: searchParams.get("search") ?? undefined,
    }),
    [searchParams]
  );

  const sortBy = (searchParams.get("sort") as SortOption) ?? "latest";

  const updateParams = useCallback(
    (updates: Partial<ProductFilters & { sort: SortOption }>) => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      Object.entries(updates).forEach(([key, value]) => {
        const current = params.get(key);

        if (value === undefined) {
          if (current !== null) {
            params.delete(key);
            changed = true;
          }
        } else {
          const stringValue = String(value);
          if (current !== stringValue) {
            params.set(key, stringValue);
            changed = true;
          }
        }
      });

      if (!changed) return;

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return {
    filters,
    sortBy,

    setSearch: (v?: string) => updateParams({ search: v }),
    setCategory: (v?: number) => updateParams({ category: v }),
    setTag: (v?: number) => updateParams({ tag: v }),
    setSize: (v?: number) => updateParams({ size: v }),
    setSortBy: (v: SortOption) => updateParams({ sort: v }),

    clearFilters: () => router.replace("?", { scroll: false }),
  };
}
