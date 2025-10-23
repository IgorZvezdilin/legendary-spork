"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Types for context state and actions
 */

interface AppState {
  date: string | undefined;
}

interface AppActions {
  setDate: (d: string | undefined) => void;
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
  initialDate?: string | undefined;
}> = ({ children, initialDate = undefined }) => {
  const [date, setDateState] = useState<string | undefined>(initialDate);

  // action wrappers (memoized)
  const setDate = useCallback((d: string | undefined) => setDateState(d), []);

  // memoize value to avoid unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      date,
      setDate,
    }),
    [date, setDate]
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
