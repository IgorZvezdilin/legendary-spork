import { apiFetch } from "@/lib/auth";

export type Company = {
  id: string;
  name: string;
};

export async function listCompanies(): Promise<Company[]> {
  const response = await apiFetch("/companies", { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to load companies");
  }
  return (await response.json()) as Company[];
}

export async function createCompany(input: { name: string }): Promise<Company> {
  const response = await apiFetch("/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create company");
  }

  return (await response.json()) as Company;
}

export async function getCompany(companyId: string): Promise<Company> {
  const response = await apiFetch(`/companies/${companyId}`, { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to load company");
  }
  return (await response.json()) as Company;
}

export async function updateCompany(
  companyId: string,
  input: { name: string }
): Promise<Company> {
  const response = await apiFetch(`/companies/${companyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update company");
  }

  return (await response.json()) as Company;
}

export async function deleteCompany(companyId: string): Promise<void> {
  const response = await apiFetch(`/companies/${companyId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete company");
  }
}
