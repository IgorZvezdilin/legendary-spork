import { apiFetch } from "@/lib/auth";

export type Article = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  links: string[];
};

export type ArticleInput = {
  title: string;
  subtitle?: string;
  content: string;
  author?: string;
};

function withCompanyHeader(companyId: string) {
  return {
    "x-company-id": companyId,
  };
}

function articleBasePath(reportId: string, articleGroupId: string) {
  return `/admin/reports/${reportId}/article-groups/${articleGroupId}/articles`;
}

export async function listArticles(
  companyId: string,
  reportId: string,
  articleGroupId: string
): Promise<Article[]> {
  const response = await apiFetch(articleBasePath(reportId, articleGroupId), {
    method: "GET",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to load articles");
  }

  return (await response.json()) as Article[];
}

export async function createArticle(
  companyId: string,
  reportId: string,
  articleGroupId: string,
  input: ArticleInput
): Promise<Article> {
  const response = await apiFetch(articleBasePath(reportId, articleGroupId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withCompanyHeader(companyId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create article");
  }

  return (await response.json()) as Article;
}

export async function getArticle(
  companyId: string,
  reportId: string,
  articleGroupId: string,
  articleId: string
): Promise<Article> {
  const response = await apiFetch(`${articleBasePath(reportId, articleGroupId)}/${articleId}`, {
    method: "GET",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to load article");
  }

  return (await response.json()) as Article;
}

export async function updateArticle(
  companyId: string,
  reportId: string,
  articleGroupId: string,
  articleId: string,
  input: ArticleInput
): Promise<Article> {
  const response = await apiFetch(`${articleBasePath(reportId, articleGroupId)}/${articleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...withCompanyHeader(companyId),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update article");
  }

  return (await response.json()) as Article;
}

export async function deleteArticle(
  companyId: string,
  reportId: string,
  articleGroupId: string,
  articleId: string
): Promise<void> {
  const response = await apiFetch(`${articleBasePath(reportId, articleGroupId)}/${articleId}`, {
    method: "DELETE",
    headers: withCompanyHeader(companyId),
  });

  if (!response.ok) {
    throw new Error("Failed to delete article");
  }
}
