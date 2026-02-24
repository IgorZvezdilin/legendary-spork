import { apiFetch } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ReportItem = {
  id: string;
  date: string;
  is_published: boolean;
  article_group_ids: string[];
};

export type ReportInput = {
  date: string;
};

export type PublicReportArticle = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  links: string[];
};

export type PublicReportGroup = {
  id: string;
  title: string;
  articles: PublicReportArticle[];
};

export type PublicReport = {
  id: string;
  date: string;
  is_published: boolean;
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
  date?: string
): Promise<ReportItem[]> {
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const query = `?date=${encodeURIComponent(date || fallbackDate)}`;
  const response = await apiFetch(`/admin/reports${query}`, {
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
