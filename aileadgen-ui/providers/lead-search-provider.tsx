"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type LeadSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  clearQuery: () => void;
};

const LeadSearchContext = createContext<LeadSearchContextValue | null>(null);

export function LeadSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState("");

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState("");
  }, []);

  const value = useMemo(() => ({ query, setQuery, clearQuery }), [query, setQuery, clearQuery]);

  return <LeadSearchContext.Provider value={value}>{children}</LeadSearchContext.Provider>;
}

export function useLeadSearch() {
  const ctx = useContext(LeadSearchContext);
  if (!ctx) {
    throw new Error("useLeadSearch must be used within LeadSearchProvider");
  }
  return ctx;
}
