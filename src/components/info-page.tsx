"use client";
import { useParams } from "next/navigation";
import { companyNewsBySection } from "./constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { EmptyInfo } from "./empty-info";
import { useAppContext } from "@/contexts/filter.context";
import { useMemo } from "react";
import { formatReachNumber } from "@/lib/utils";

export const InfoPageComponent = () => {
  const { slug }: { slug: keyof typeof companyNewsBySection } = useParams();
  const { dateRange, appliedQuery, filters } = useAppContext();

  const filterDate = useMemo(() => {
    if (!dateRange?.from) return null;
    const [year, month, day] = dateRange.from.split("-");
    if (!year || !month || !day) return null;
    return `${day}.${month}.${year}`;
  }, [dateRange]);

  const matchesSearch = (content: string) => {
    if (!appliedQuery.trim()) return true;
    return content.toLowerCase().includes(appliedQuery.trim().toLowerCase());
  };

  const matchesFilters = (
    item: (typeof companyNewsBySection)[keyof typeof companyNewsBySection]["newses"][number]
  ) => {
    if (filters.media.length && !filters.media.includes(item.media_name)) return false;
    if (filters.sources.length) {
      const sourceNames = (item.source || []).map((s) => s.name);
      if (!sourceNames.some((name) => filters.sources.includes(name))) return false;
    }
    if (filters.categories.length) {
      const subtitle = item.subtitle?.toLowerCase() ?? "";
      if (!filters.categories.some((cat) => subtitle.includes(cat.toLowerCase()))) return false;
    }
    return true;
  };
  const [data, setData] = useState(companyNewsBySection[slug]);
  const [newses, setNewses] = useState(companyNewsBySection[slug].newses);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (filterDate) {
      const filteredNewses = newses.filter((item) => {
        if (!dateRange?.from || !dateRange?.to) {
          return item.date === filterDate && matchesSearch(item.content) && matchesFilters(item);
        }
        const [day, month, year] = item.date.split(".").map(Number);
        if (!day || !month || !year) return false;
        const itemDate = new Date(year, month - 1, day);
        const [fromYear, fromMonth, fromDay] = dateRange.from.split("-").map(Number);
        const [toYear, toMonth, toDay] = dateRange.to.split("-").map(Number);
        if (!fromYear || !fromMonth || !fromDay || !toYear || !toMonth || !toDay) {
          return item.date === filterDate && matchesSearch(item.content) && matchesFilters(item);
        }
        const start = new Date(fromYear, fromMonth - 1, fromDay);
        const end = new Date(toYear, toMonth - 1, toDay);
        return (
          itemDate >= start &&
          itemDate <= end &&
          matchesSearch(item.content) &&
          matchesFilters(item)
        );
      });
      setNewses(filteredNewses);
    } else {
      setNewses(
        companyNewsBySection[slug].newses.filter(
          (item) => matchesSearch(item.content) && matchesFilters(item)
        )
      );
    }
  }, [filterDate, dateRange, appliedQuery, filters]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-16 font-sans">
      <h1 className="mt-10 scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {data.topic}
      </h1>

      <div className="flex max-w-[80%] min-w-[80%] flex-1 flex-col justify-center gap-5">
        {newses.length === 0 ? (
          <EmptyInfo />
        ) : (
          <div className="space-y-8">
            {Object.entries(
              newses.reduce<Record<string, typeof newses>>((acc, item) => {
                const key = item.subtitle?.trim() ? item.subtitle : "__ungrouped__";
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
              }, {})
            ).map(([subtitle, items]) => {
              const isUngrouped = subtitle === "__ungrouped__";
              if (isUngrouped) {
                return (
                  <div key={subtitle} className="space-y-4">
                    {items.map((news, index) => {
                      const itemKey = `${slug}-${news.id || index}`;
                      const isExpanded = Boolean(expandedItems[itemKey]);
                      return (
                        <Card key={itemKey}>
                          <CardHeader>
                            <CardTitle className="text-foreground">{news.title}</CardTitle>
                            <CardDescription>
                              <p className="leading-7 not-first:mt-6">{news.date}</p>
                              <div className="flex gap-2">
                                <p>Источник:</p>
                                {news.source?.[0]?.url ? (
                                  <a
                                    className="text-foreground no-underline underline-offset-2 transition hover:underline"
                                    href={news.source[0].url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {news.source[0].name || news.source[0].url}
                                  </a>
                                ) : (
                                  <p className="text-foreground">
                                    {news.source?.[0]?.name || "—"}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <p>Медиа</p>
                                <p className="text-foreground">{news.media_name || "—"}</p>
                              </div>
                              <div className="flex gap-2">
                                <p>Перепечатки</p>
                                <div className="flex flex-wrap gap-1">
                                  {news.reprints?.length ? (
                                    news.reprints.map((item, idx) => (
                                      <span key={`${item.name}-${idx}`} className="text-foreground">
                                        {item.url ? (
                                          <a
                                            className="text-foreground no-underline underline-offset-2 transition hover:underline"
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {item.name || item.url}
                                          </a>
                                        ) : (
                                          item.name
                                        )}
                                        {idx < news.reprints.length - 1 ? ", " : ""}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-foreground">—</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <p>Общий охват СМИ</p>
                                <p className="text-foreground">
                                  {news.total_media_reach !== undefined
                                    ? formatReachNumber(news.total_media_reach)
                                    : "—"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <p>Публикаций по теме</p>
                                <p className="text-foreground">
                                  {news.topic_publications_count !== undefined
                                    ? formatReachNumber(news.topic_publications_count)
                                    : "—"}
                                </p>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {news.subtitle ? (
                              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                                {news.subtitle}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              className="text-primary mt-2 text-sm font-medium"
                              onClick={() =>
                                setExpandedItems((prev) => ({
                                  ...prev,
                                  [itemKey]: !prev[itemKey],
                                }))
                              }
                            >
                              {isExpanded ? "Скрыть" : "Показать больше"}
                            </button>
                            {isExpanded ? (
                              <p className="mt-3 text-sm leading-7">{news.content}</p>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div
                  key={subtitle}
                  className="border-border/60 bg-card rounded-xl border p-4 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{subtitle}</h3>
                  <div className="mt-4 space-y-4">
                    {items.map((news, index) => {
                      const itemKey = `${slug}-${news.id || index}`;
                      const isExpanded = Boolean(expandedItems[itemKey]);
                      return (
                        <Card key={itemKey} className="bg-background/60">
                          <CardHeader>
                            <CardTitle className="text-foreground">{news.title}</CardTitle>
                            <CardDescription>
                              <p className="leading-7 not-first:mt-6">{news.date}</p>
                              <div className="flex gap-2">
                                <p>Источник:</p>
                                {news.source?.[0]?.url ? (
                                  <a
                                    className="text-foreground no-underline underline-offset-2 transition hover:underline"
                                    href={news.source[0].url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {news.source[0].name || news.source[0].url}
                                  </a>
                                ) : (
                                  <p className="text-foreground">
                                    {news.source?.[0]?.name || "—"}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <p>Медиа</p>
                                <p className="text-foreground">{news.media_name || "—"}</p>
                              </div>
                              <div className="flex gap-2">
                                <p>Перепечатки</p>
                                <div className="flex flex-wrap gap-1">
                                  {news.reprints?.length ? (
                                    news.reprints.map((item, idx) => (
                                      <span key={`${item.name}-${idx}`} className="text-foreground">
                                        {item.url ? (
                                          <a
                                            className="text-foreground no-underline underline-offset-2 transition hover:underline"
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {item.name || item.url}
                                          </a>
                                        ) : (
                                          item.name
                                        )}
                                        {idx < news.reprints.length - 1 ? ", " : ""}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-foreground">—</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <p>Общий охват СМИ</p>
                                <p className="text-foreground">
                                  {news.total_media_reach !== undefined
                                    ? formatReachNumber(news.total_media_reach)
                                    : "—"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <p>Публикаций по теме</p>
                                <p className="text-foreground">
                                  {news.topic_publications_count !== undefined
                                    ? formatReachNumber(news.topic_publications_count)
                                    : "—"}
                                </p>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {news.subtitle ? (
                              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                                {news.subtitle}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              className="text-primary mt-2 text-sm font-medium"
                              onClick={() =>
                                setExpandedItems((prev) => ({
                                  ...prev,
                                  [itemKey]: !prev[itemKey],
                                }))
                              }
                            >
                              {isExpanded ? "Скрыть" : "Показать больше"}
                            </button>
                            {isExpanded ? (
                              <p className="mt-3 text-sm leading-7">{news.content}</p>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
