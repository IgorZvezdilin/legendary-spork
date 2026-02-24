import { apiFetch } from "@/lib/auth";

export type ArticleGroup = {
  id: string;
  title: string;
};

export type ArticleGroupInput = {
  title: string;
};

function withCompanyHeader(companyId: string) {
  return {
    "x-company-id": companyId,
  };
}

export async function listArticleGroups(
  companyId: string,
  reportId: string
): Promise<ArticleGroup[]> {
  const response = await apiFetch(`/admin/reports/${reportId}/article-groups`, {
    method: "GET",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to load article groups");
  }

  return (await response.json()) as ArticleGroup[];
}

export async function createArticleGroup(
  companyId: string,
  reportId: string,
  input: ArticleGroupInput
): Promise<ArticleGroup> {
  const response = await apiFetch(`/admin/reports/${reportId}/article-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withCompanyHeader(companyId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create article group");
  }

  return (await response.json()) as ArticleGroup;
}

export async function getArticleGroup(
  companyId: string,
  reportId: string,
  articleGroupId: string
): Promise<ArticleGroup> {
  const response = await apiFetch(
    `/admin/reports/${reportId}/article-groups/${articleGroupId}`,
    {
      method: "GET",
      headers: withCompanyHeader(companyId),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load article group");
  }

  return (await response.json()) as ArticleGroup;
}

export async function updateArticleGroup(
  companyId: string,
  reportId: string,
  articleGroupId: string,
  input: ArticleGroupInput
): Promise<ArticleGroup> {
  const response = await apiFetch(
    `/admin/reports/${reportId}/article-groups/${articleGroupId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...withCompanyHeader(companyId),
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update article group");
  }

  return (await response.json()) as ArticleGroup;
}

export async function deleteArticleGroup(
  companyId: string,
  reportId: string,
  articleGroupId: string
): Promise<void> {
  const response = await apiFetch(
    `/admin/reports/${reportId}/article-groups/${articleGroupId}`,
    {
      method: "DELETE",
      headers: withCompanyHeader(companyId),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete article group");
  }
}
