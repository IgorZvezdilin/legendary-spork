"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { companyNewsBySection } from "@/components/constants";
import { useAppContext } from "@/contexts/filter.context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyInfo } from "@/components/empty-info";
import { formatReachNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { dateRange, setDateRange, weeklyTopOverrides, appliedQuery, filters } = useAppContext();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const isWithinRange = (value: string) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const [day, month, year] = value.split(".").map(Number);
    if (!day || !month || !year) return false;
    const [fromYear, fromMonth, fromDay] = dateRange.from.split("-").map(Number);
    const [toYear, toMonth, toDay] = dateRange.to.split("-").map(Number);
    if (!fromYear || !fromMonth || !fromDay || !toYear || !toMonth || !toDay) return true;
    const itemDate = new Date(year, month - 1, day);
    const start = new Date(fromYear, fromMonth - 1, fromDay);
    const end = new Date(toYear, toMonth - 1, toDay);
    return itemDate >= start && itemDate <= end;
  };
  const isWeeklyTop = (id: string, fallback?: boolean) =>
    id in weeklyTopOverrides ? weeklyTopOverrides[id] : Boolean(fallback);
  const matchesSearch = useCallback(
    (content: string) => {
      if (!appliedQuery.trim()) return true;
      return content.toLowerCase().includes(appliedQuery.trim().toLowerCase());
    },
    [appliedQuery]
  );
  const normalizedFilters = useMemo(
    () => ({
      media: filters.media.map((item) => item.toLowerCase()),
      categories: filters.categories.map((item) => item.toLowerCase()),
      sources: filters.sources.map((item) => item.toLowerCase()),
    }),
    [filters]
  );
  const matchesFilters = useCallback(
    (
    item: (typeof companyNewsBySection)[keyof typeof companyNewsBySection]["newses"][number]
    ) => {
      if (
        normalizedFilters.media.length &&
        !normalizedFilters.media.includes((item.media_name ?? "").toLowerCase())
      )
        return false;
      if (normalizedFilters.sources.length) {
        const sourceNames = (item.source || []).map((s) => (s.name ?? "").toLowerCase());
        if (!sourceNames.some((name) => normalizedFilters.sources.includes(name))) return false;
      }
      if (normalizedFilters.categories.length) {
        const subtitle = item.subtitle?.toLowerCase() ?? "";
        if (!normalizedFilters.categories.some((cat) => subtitle.includes(cat))) return false;
      }
      return true;
    },
    [normalizedFilters]
  );
  const filterDate = useMemo(() => {
    if (!dateRange?.from) return null;
    const [year, month, day] = dateRange.from.split("-");
    if (!year || !month || !day) return null;
    return `${day}.${month}.${year}`;
  }, [dateRange]);
  const filteredSections = useMemo(() => {
    return (Object.keys(companyNewsBySection) as (keyof typeof companyNewsBySection)[]).map(
      (sectionKey) => {
        const section = companyNewsBySection[sectionKey];
        const newses = filterDate
          ? section.newses.filter((item) => {
              if (!dateRange?.from || !dateRange?.to) {
                return (
                  item.date === filterDate && matchesSearch(item.content) && matchesFilters(item)
                );
              }
              return isWithinRange(item.date) && matchesSearch(item.content) && matchesFilters(item);
            })
          : section.newses.filter((item) => matchesSearch(item.content) && matchesFilters(item));
        return { sectionKey, section, newses };
      }
    );
  }, [filterDate, dateRange, matchesFilters, matchesSearch]);
  useEffect(() => {
    const target = localStorage.getItem("home_section");
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    localStorage.removeItem("home_section");
  }, []);

  const currentBaseDate = useMemo(() => {
    const raw = dateRange?.from ?? new Date().toISOString().slice(0, 10);
    const [year, month, day] = raw.split("-").map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
  }, [dateRange]);

  const startOfWeek = (value: Date) => {
    const day = value.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const result = new Date(value);
    result.setDate(value.getDate() + mondayOffset);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfWeek = (value: Date) => {
    const start = startOfWeek(value);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(0, 0, 0, 0);
    return end;
  };

  const formatDisplayDate = (value: Date) => {
    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const weekStart = useMemo(() => {
    if (dateRange?.from) {
      const [year, month, day] = dateRange.from.split("-").map(Number);
      if (year && month && day) return new Date(year, month - 1, day);
    }
    return startOfWeek(currentBaseDate);
  }, [currentBaseDate, dateRange]);

  const weekEnd = useMemo(() => {
    if (dateRange?.to) {
      const [year, month, day] = dateRange.to.split("-").map(Number);
      if (year && month && day) return new Date(year, month - 1, day);
    }
    return endOfWeek(currentBaseDate);
  }, [currentBaseDate, dateRange]);

  const toLocalDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-12">
      <div className="mt-10 flex w-full flex-col items-center gap-6 px-6 lg:flex-row lg:justify-between">
        <Button
          type="button"
          size="sm"
          className="order-2 w-full lg:order-1 lg:w-auto"
          onClick={() => {
            const start = startOfWeek(currentBaseDate);
            const prev = new Date(start);
            prev.setDate(start.getDate() - 7);
            const prevEnd = new Date(prev);
            prevEnd.setDate(prev.getDate() + 6);
            setDateRange({ from: toLocalDate(prev), to: toLocalDate(prevEnd) });
          }}
        >
          Предыдущая неделя
        </Button>
        <h1 className="order-1 scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance lg:order-2">
          Еженедельный
          <br />
          дайджет
          <br />
          {formatDisplayDate(weekStart)} — {formatDisplayDate(weekEnd)}
        </h1>
        <Button
          type="button"
          size="sm"
          className="order-3 w-full lg:order-3 lg:w-auto"
          onClick={() => {
            const start = startOfWeek(currentBaseDate);
            const next = new Date(start);
            next.setDate(start.getDate() + 7);
            const nextEnd = new Date(next);
            nextEnd.setDate(next.getDate() + 6);
            setDateRange({ from: toLocalDate(next), to: toLocalDate(nextEnd) });
          }}
        >
          Следующая неделя
        </Button>
      </div>

      <div className="flex w-full max-w-[80%] flex-col gap-16 pb-12">
        {(() => {
          const topWeekly = Object.values(companyNewsBySection)
            .flatMap((section) => section.newses)
            .filter(
              (item) =>
                isWeeklyTop(item.id, item.is_weekly_top) &&
                isWithinRange(item.date) &&
                matchesSearch(item.content) &&
                matchesFilters(item)
            );
          if (topWeekly.length === 0) return null;
          return (
            <section id="top_week" className="scroll-mt-24 space-y-6">
              <h2 className="text-3xl font-bold">Лучшие новости недели</h2>
              <div className="space-y-4">
                {topWeekly.map((news, index) => {
                  const itemKey = `top_week-${news.id || index}`;
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
                              <p className="text-foreground">{news.source?.[0]?.name || "—"}</p>
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
            </section>
          );
        })()}
        {filteredSections.every((item) => item.newses.length === 0) ? <EmptyInfo /> : null}
        {filteredSections.map(({ sectionKey, section, newses }) => {
          const groupedNews = newses.reduce<Record<string, typeof newses>>((acc, item) => {
              const key = item.subtitle?.trim() ? item.subtitle : "__ungrouped__";
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            }, {});
            const groupedEntries = Object.entries(groupedNews);

            if (newses.length === 0) {
              return null;
            }

            return (
              <section key={sectionKey} id={sectionKey} className="scroll-mt-24 space-y-6">
                <h2 className="text-3xl font-bold">{section.topic}</h2>
                <div className="space-y-8">
                  {groupedEntries.map(([subtitle, items]) => {
                    const isUngrouped = subtitle === "__ungrouped__";
                    if (isUngrouped) {
                      return (
                        <div key={subtitle} className="space-y-4">
                          {items.map((news, index) => {
                            const itemKey = `${sectionKey}-${news.id || index}`;
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
                                            <span
                                              key={`${item.name}-${idx}`}
                                              className="text-foreground"
                                            >
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
                            const itemKey = `${sectionKey}-${news.id || index}`;
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
                                            <span
                                              key={`${item.name}-${idx}`}
                                              className="text-foreground"
                                            >
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
              </section>
            );
        })}
      </div>
    </div>
  );
}
