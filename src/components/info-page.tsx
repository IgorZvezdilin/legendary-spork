"use client";
import { useParams } from "next/navigation";
import { ClampText } from "./clamp-text";
import { companyNewsBySection } from "./constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { EmptyInfo } from "./empty-info";
import { useAppContext } from "@/contexts/filter.context";

export const InfoPageComponent = () => {
  const { slug }: { slug: keyof typeof companyNewsBySection } = useParams();
  const { date } = useAppContext();
  const [data, setData] = useState(companyNewsBySection[slug]);
  const [newses, setNewses] = useState(companyNewsBySection[slug].newses);

  useEffect(() => {
    if (date) {
      const filteredNewses = newses.filter((item) => item.date === date);
      setNewses(filteredNewses);
    } else {
      setNewses(companyNewsBySection[slug].newses);
    }
  }, [date]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-16 font-sans">
      <h1 className="mt-10 scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {data.topic}
      </h1>

      <div className="flex max-w-[80%] min-w-[80%] flex-1 flex-col justify-center gap-5">
        {newses.length === 0 ? (
          <EmptyInfo />
        ) : (
          newses.map((news, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-white">{news.title}</CardTitle>
                <CardDescription>
                  <p className="leading-7 not-first:mt-6">{news.date}</p>
                  <div className="flex gap-2">
                    <p>Источник:</p>
                    <p className="text-white"> {news.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <p>Упоминания</p>
                    <p className="text-white">{news.branches.join(", ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <p>Автор</p>
                    <p className="text-white">{news.author}</p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClampText text={news.text} lines={1} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
