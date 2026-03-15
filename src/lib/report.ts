import { apiFetch } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ReportItem = {
  id: string;
  date_start: string;
  date_end: string;
  is_published: boolean;
  article_group_ids: string[];
};

export type ReportInput = {
  date_start: string;
  date_end: string;
};

export type PublicReportArticle = {
  title: string;
  subtitle: string;
  content: string;
  media_name: string;
  source: { name: string; url: string }[];
  reprints: { name: string; url: string }[];
  is_weekly_top: boolean;
  total_media_reach: number;
  topic_publications_count: number;
};

export type PublicReportGroup = {
  title: string;
  subgroup: string;
  articles: PublicReportArticle[];
};

export type PublicReport = {
  date_start: string;
  date_end: string;
  article_groups: PublicReportGroup[];
};

function withCompanyHeader(companyId: string) {
  return {
    "x-company-id": companyId,
  };
}

function resolveUrl(input: string) {
  if (input.startsWith("/") && API_BASE_URL) {
    return `${API_BASE_URL}${input}`;
  }

  return input;
}

export async function listReports(
  companyId: string,
  params?: {
    date?: string;
    date_start?: string;
    date_from?: string;
    date_to?: string;
  }
): Promise<ReportItem[]> {
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const queryParams = new URLSearchParams();
  queryParams.set("date", params?.date || fallbackDate);
  if (params?.date_start) queryParams.set("date_start", params.date_start);
  if (params?.date_from) queryParams.set("date_from", params.date_from);
  if (params?.date_to) queryParams.set("date_to", params.date_to);
  const response = await apiFetch(`/admin/reports?${queryParams.toString()}`, {
    method: "GET",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to load reports");
  }

  return (await response.json()) as ReportItem[];
}

export async function createReport(companyId: string, input: ReportInput): Promise<ReportItem> {
  const response = await apiFetch("/admin/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withCompanyHeader(companyId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("REPORT_DATE_CONFLICT");
    }
    throw new Error("Failed to create report");
  }

  return (await response.json()) as ReportItem;
}

export async function getReport(companyId: string, reportId: string): Promise<ReportItem> {
  const response = await apiFetch(`/admin/reports/${reportId}`, {
    method: "GET",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to load report");
  }

  return (await response.json()) as ReportItem;
}

export async function updateReport(
  companyId: string,
  reportId: string,
  input: ReportInput
): Promise<ReportItem> {
  const response = await apiFetch(`/admin/reports/${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...withCompanyHeader(companyId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update report");
  }

  return (await response.json()) as ReportItem;
}

export async function deleteReport(companyId: string, reportId: string): Promise<void> {
  const response = await apiFetch(`/admin/reports/${reportId}`, {
    method: "DELETE",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to delete report");
  }
}

export async function publishReport(companyId: string, reportId: string): Promise<ReportItem> {
  const response = await apiFetch(`/admin/reports/${reportId}/publish`, {
    method: "POST",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to publish report");
  }

  return (await response.json()) as ReportItem;
}

export async function getPublicReportByDate(date: string): Promise<PublicReport> {
  const response = await fetch(resolveUrl(`/reports?date=${encodeURIComponent(date)}`), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to load report");
  }

  return (await response.json()) as PublicReport;
}

export async function getPublicReport(reportId: string): Promise<PublicReport> {
  const response = await fetch(resolveUrl(`/reports/${reportId}/full`), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to load report");
  }

  return (await response.json()) as PublicReport;
}

export async function getPublicReportFiltered(params: {
  date?: string;
  search?: string;
  media?: string[];
  category?: string[];
  source?: string[];
  companyName?: string;
}): Promise<PublicReport> {
  const query = new URLSearchParams();
  if (params.date) query.set("date", params.date);
  if (params.search) query.set("search", params.search);
  params.media?.forEach((value) => query.append("media", value));
  params.category?.forEach((value) => query.append("category", value));
  params.source?.forEach((value) => query.append("source", value));

  const response = await fetch(resolveUrl(`/reports?${query.toString()}`), {
    method: "GET",
    headers: params.companyName ? { "x-company-name": params.companyName } : undefined,
  });

  if (!response.ok) {
    throw new Error("Failed to load report");
  }

  return (await response.json()) as PublicReport;
}
