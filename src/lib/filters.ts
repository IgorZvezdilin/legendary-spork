import { apiFetch } from "@/lib/auth";

function resolveCompanyNameHeader(companyName?: string) {
  if (companyName) return companyName;
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem("company_name") || undefined;
}

function withCompanyNameHeader(companyName?: string) {
  const resolved = resolveCompanyNameHeader(companyName);
  return resolved ? { "x-company-name": resolved } : undefined;
}

export async function listMedia(params: {
  search?: string;
  limit?: number;
  offset?: number;
  companyName?: string;
}): Promise<string[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const response = await apiFetch(`/media?${query.toString()}`, {
    method: "GET",
    headers: withCompanyNameHeader(params.companyName),
  });

  if (!response.ok) {
    throw new Error("Failed to load media");
  }

  return (await response.json()) as string[];
}

export async function listCategories(params: {
  search?: string;
  limit?: number;
  offset?: number;
  companyName?: string;
}): Promise<string[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const response = await apiFetch(`/categories?${query.toString()}`, {
    method: "GET",
    headers: withCompanyNameHeader(params.companyName),
  });

  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  return (await response.json()) as string[];
}

export async function listSources(params: {
  search?: string;
  limit?: number;
  offset?: number;
  companyName?: string;
}): Promise<string[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const response = await apiFetch(`/sources?${query.toString()}`, {
    method: "GET",
    headers: withCompanyNameHeader(params.companyName),
  });

  if (!response.ok) {
    throw new Error("Failed to load sources");
  }

  return (await response.json()) as string[];
}
