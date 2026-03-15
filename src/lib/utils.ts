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
        subtitle: string;
        content: string;
        media_name: string;
        source: { name: string; url: string }[];
        reprints: { name: string; url: string }[];
        is_weekly_top: boolean;
        total_media_reach: number;
        topic_publications_count: number;
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
    "subtitle",
    "content",
    "media_name",
    "source_name",
    "source_url",
    "reprint_name",
    "reprint_url",
    "is_weekly_top",
    "total_media_reach",
    "topic_publications_count",
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
        news.subtitle,
        news.content,
        news.media_name,
        news.source?.[0]?.name ?? "",
        news.source?.[0]?.url ?? "",
        news.reprints?.[0]?.name ?? "",
        news.reprints?.[0]?.url ?? "",
        news.is_weekly_top ? "true" : "false",
        news.total_media_reach ?? 0,
        news.topic_publications_count ?? 0,
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

export function formatReachNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);

  if (abs < 1000) {
    return Math.floor(value).toString();
  }

  if (abs < 1_000_000) {
    return `${Math.floor(value / 1000)} тыс`;
  }

  if (abs < 1_000_000_000) {
    const millions = value / 1_000_000;
    if (Number.isInteger(millions)) {
      return `${millions} млн`;
    }
    const decimals = Math.abs(millions) < 10 ? 3 : 1;
    return `${formatFloor(millions, decimals)} млн`;
  }

  const billions = value / 1_000_000_000;
  if (Number.isInteger(billions)) {
    return `${billions} млрд`;
  }
  return `${formatFloor(billions, 1)} млрд`;
}

function formatFloor(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  const floored = Math.floor(value * factor) / factor;
  return floored.toFixed(decimals).replace(/\.?0+$/, "");
}
