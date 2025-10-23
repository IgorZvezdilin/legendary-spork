import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadSectionsAsCSV(
  data: Record<
    string,
    {
      id: string;
      topic: string;
      newses: {
        id: string;
        title: string;
        date: string;
        source: string;
        branches: string[];
        author: string;
        text: string;
      }[];
    }
  >,
  filename: string = "news.csv"
) {
  if (!data || Object.keys(data).length === 0) {
    console.warn("No data to export.");
    return;
  }

  // CSV headers
  const headers = [
    "section",
    "section_id",
    "topic",
    "news_id",
    "title",
    "date",
    "source",
    "branches",
    "author",
    "text",
  ];

  // Collect all rows
  const rows: string[] = [];

  Object.entries(data).forEach(([section, sectionData]) => {
    sectionData.newses.forEach((news) => {
      const row = [
        section,
        sectionData.id,
        sectionData.topic,
        news.id,
        news.title,
        news.date,
        news.source,
        news.branches.join(", "),
        news.author,
        news.text,
      ].map((val) => `"${String(val).replace(/"/g, '""')}"`); // escape CSV safely

      rows.push(row.join(","));
    });
  });

  // Combine into full CSV text
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
