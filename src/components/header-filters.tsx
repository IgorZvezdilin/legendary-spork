"use client";

import { useEffect, useRef, useState } from "react";
import { ListFilter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/filter.context";
import { listCategories, listMedia, listSources } from "@/lib/filters";
import { companyNewsBySection } from "@/components/constants";

type OptionState = {
  media: string[];
  categories: string[];
  sources: string[];
};

export function HeaderFilters() {
  const { filters, setFilters } = useAppContext();
  const [open, setOpen] = useState(false);
  const hasFilters = Boolean(
    filters.media.length || filters.categories.length || filters.sources.length
  );
  const [options, setOptions] = useState<OptionState>({
    media: [],
    categories: [],
    sources: [],
  });
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setIsLoading(true);
    Promise.all([listMedia({}), listCategories({}), listSources({})])
      .then(([media, categories, sources]) => {
        if (!isMounted) return;
        setOptions({
          media: media.length ? media : getMockMedia(),
          categories: categories.length ? categories : getMockCategories(),
          sources: sources.length ? sources : getMockSources(),
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setOptions({
          media: getMockMedia(),
          categories: getMockCategories(),
          sources: getMockSources(),
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [open]);

  const toggleValue = (field: keyof OptionState, value: string) => {
    setLocalFilters((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      };
    });
  };

  const handleSubmit = () => {
    setFilters(localFilters);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("news_filters", JSON.stringify(localFilters));
    }
    setOpen(false);
  };

  const handleReset = () => {
    const cleared = { media: [], categories: [], sources: [] };
    setLocalFilters(cleared);
    setFilters(cleared);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("news_filters");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Фильтры" className="relative">
          <ListFilter className="size-4" />
          {hasFilters ? (
            <span className="bg-amber-400 text-amber-950 absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
              !
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-4"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className="grid gap-4">
          <SearchableMultiSelect
            title="Медиа"
            placeholder="Начните вводить медиа"
            items={options.media}
            selected={localFilters.media}
            isLoading={isLoading}
            onSelect={(value) => toggleValue("media", value)}
            onRemove={(value) => toggleValue("media", value)}
          />

          <SearchableMultiSelect
            title="Категории"
            placeholder="Начните вводить категорию"
            items={options.categories}
            selected={localFilters.categories}
            isLoading={isLoading}
            onSelect={(value) => toggleValue("categories", value)}
            onRemove={(value) => toggleValue("categories", value)}
          />

          <SearchableMultiSelect
            title="Источники"
            placeholder="Начните вводить источник"
            items={options.sources}
            selected={localFilters.sources}
            isLoading={isLoading}
            onSelect={(value) => toggleValue("sources", value)}
            onRemove={(value) => toggleValue("sources", value)}
          />

          <div className="flex items-center gap-2">
            <Button type="button" onClick={handleSubmit}>
              Подтвердить
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Очистить фильтры
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SearchableMultiSelect({
  title,
  placeholder,
  items,
  selected,
  isLoading,
  onSelect,
  onRemove,
}: {
  title: string;
  placeholder: string;
  items: string[];
  selected: string[];
  isLoading: boolean;
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = items.filter(
    (item) =>
      item.toLowerCase().includes(query.trim().toLowerCase()) &&
      !selected.includes(item)
  );

  return (
    <div className="grid gap-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          placeholder={placeholder}
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
        />
        {open ? (
          <div className="border-border bg-popover absolute z-10 mt-1 w-full max-h-[300px] overflow-auto rounded-md border p-2 shadow-md">
            {isLoading ? (
              <p className="text-muted-foreground text-xs">Загрузка...</p>
            ) : filtered.length ? (
              <div className="grid gap-1">
                {filtered.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="hover:bg-accent rounded-md px-2 py-1 text-left text-sm"
                    onClick={() => {
                      onSelect(item);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Нет вариантов</p>
            )}
          </div>
        ) : null}
      </div>
      {selected.length ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              className="bg-muted text-foreground hover:bg-muted/80 rounded-full px-3 py-1 text-xs"
              onClick={() => onRemove(item)}
            >
              {item} ✕
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Ничего не выбрано</p>
      )}
    </div>
  );
}

function getMockMedia() {
  const values = new Set<string>();
  Object.values(companyNewsBySection).forEach((section) => {
    section.newses.forEach((item) => {
      if (item.media_name) values.add(item.media_name);
    });
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function getMockCategories() {
  const values = new Set<string>();
  Object.values(companyNewsBySection).forEach((section) => {
    section.newses.forEach((item) => {
      if (item.subtitle) values.add(item.subtitle);
    });
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function getMockSources() {
  const values = new Set<string>();
  Object.values(companyNewsBySection).forEach((section) => {
    section.newses.forEach((item) => {
      (item.source || []).forEach((source) => {
        if (source.name) values.add(source.name);
      });
    });
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}
