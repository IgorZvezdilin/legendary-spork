"use client";

import { Search } from "lucide-react";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/filter.context";

export function HeaderSearch() {
  const { searchInput, setSearchInput, setAppliedQuery } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedQuery(searchInput);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchInput, setAppliedQuery]);

  return (
    <div className="grid w-full max-w-xs gap-2">
      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Поиск по тексту новости"
          className="border-input bg-background h-9 w-full rounded-md border pr-10 pl-3 text-sm"
        />
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
      </div>
    </div>
  );
}
