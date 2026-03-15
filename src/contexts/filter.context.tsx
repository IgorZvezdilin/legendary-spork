"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Types for context state and actions
 */

interface AppState {
  dateRange:
    | {
        from?: string;
        to?: string;
      }
    | undefined;
  weeklyTopOverrides: Record<string, boolean>;
  searchInput: string;
  appliedQuery: string;
  filters: {
    media: string[];
    categories: string[];
    sources: string[];
  };
}

interface AppActions {
  setDateRange: (range: { from?: string; to?: string } | undefined) => void;
  setWeeklyTopOverride: (id: string, value: boolean) => void;
  setSearchInput: (value: string) => void;
  setAppliedQuery: (value: string) => void;
  setFilters: (filters: { media: string[]; categories: string[]; sources: string[] }) => void;
}

/**
 * Combined context value type
 */
type AppContextValue = AppState & AppActions;

/**
 * Create context with undefined -> enforce provider presence via hook
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Provider component
 */
export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialDateRange?: { from?: string; to?: string } | undefined;
}> = ({ children, initialDateRange = undefined }) => {
  const [dateRange, setDateRangeState] = useState<
    { from?: string; to?: string } | undefined
  >(initialDateRange);
  const [weeklyTopOverrides, setWeeklyTopOverrides] = useState<Record<string, boolean>>({});
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [filters, setFiltersState] = useState({
    media: [] as string[],
    categories: [] as string[],
    sources: [] as string[],
  });

  // action wrappers (memoized)
  const setDateRange = useCallback(
    (range: { from?: string; to?: string } | undefined) => setDateRangeState(range),
    []
  );
  const setWeeklyTopOverride = useCallback((id: string, value: boolean) => {
    setWeeklyTopOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);
  const setFilters = useCallback(
    (next: { media: string[]; categories: string[]; sources: string[] }) => {
      setFiltersState(next);
    },
    []
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("news_filters");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        media?: string[];
        categories?: string[];
        sources?: string[];
      };
      setFiltersState({
        media: parsed.media ?? [],
        categories: parsed.categories ?? [],
        sources: parsed.sources ?? [],
      });
    } catch {
      // ignore invalid storage
    }
  }, []);

  // memoize value to avoid unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      dateRange,
      setDateRange,
      weeklyTopOverrides,
      setWeeklyTopOverride,
      searchInput,
      setSearchInput,
      appliedQuery,
      setAppliedQuery,
      filters,
      setFilters,
    }),
    [
      dateRange,
      setDateRange,
      weeklyTopOverrides,
      setWeeklyTopOverride,
      searchInput,
      setSearchInput,
      appliedQuery,
      setAppliedQuery,
      filters,
      setFilters,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook for consuming context
 * throws helpful error if used outside provider
 */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an <AppProvider />");
  }
  return ctx;
}
