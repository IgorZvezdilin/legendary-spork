"use client";

import { useEffect, useMemo } from "react";
import { companyNewsBySection } from "@/components/constants";
import { useAppContext } from "@/contexts/filter.context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyInfo } from "@/components/empty-info";
import { ClampText } from "@/components/clamp-text";

export default function Home() {
  const { date } = useAppContext();
  const filterDate = useMemo(() => {
    if (!date) return null;
    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return null;
    return `${day}.${month}.${year}`;
  }, [date]);
  const selectedDate = useMemo(() => {
    const raw = date ?? new Date().toISOString().slice(0, 10);
    const [year, month, day] = raw.split("-");
    return `${day}.${month}.${year}`;
  }, [date]);

  useEffect(() => {
    const target = localStorage.getItem("home_section");
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    localStorage.removeItem("home_section");
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-12">
      <h1 className="mt-10 scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Ежедневный
        <br />
        обзор СМИ
        <br />
        от {selectedDate}
      </h1>

      <div className="flex w-full max-w-[80%] flex-col gap-16 pb-12">
        {(Object.keys(companyNewsBySection) as (keyof typeof companyNewsBySection)[]).map(
          (sectionKey, index) => {
            const section = companyNewsBySection[sectionKey];
            const newses = filterDate
              ? section.newses.filter((item) => item.date === filterDate)
              : section.newses;

            return (
              <section key={sectionKey} id={sectionKey} className="scroll-mt-24 space-y-6">
                <h2 className="text-3xl font-bold">
                  {index + 1}. {section.topic}
                </h2>
                {newses.length === 0 ? (
                  <EmptyInfo />
                ) : (
                  <div className="space-y-4">
                    {newses.map((news, index) => (
                      <Card key={`${sectionKey}-${index}`}>
                        <CardHeader>
                          <CardTitle className="text-foreground">{news.title}</CardTitle>
                          <CardDescription>
                            <p className="leading-7 not-first:mt-6">{news.date}</p>
                            <div className="flex gap-2">
                              <p>Источник:</p>
                              <p className="text-foreground"> {news.source}</p>
                            </div>
                            <div className="flex gap-2">
                              <p>Упоминания</p>
                              <p className="text-foreground">{news.branches.join(", ")}</p>
                            </div>
                            <div className="flex gap-2">
                              <p>Автор</p>
                              <p className="text-foreground">{news.author}</p>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ClampText text={news.text} lines={1} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}
