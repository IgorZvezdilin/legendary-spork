const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
};

type AuthTokensResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string" && input.startsWith("/") && API_BASE_URL) {
    return `${API_BASE_URL}${input}`;
  }

  return input;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(resolveUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const payload = (await response.json()) as Partial<AuthTokensResponse>;
    if (!payload.access_token) {
      clearTokens();
      return null;
    }

    setTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token ?? refreshToken,
      tokenType: payload.token_type,
    });

    return payload.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function withAuth(request: Request, token: string | null): Request {
  if (!token) return request;
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return new Request(request, { headers });
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const request = new Request(resolveUrl(input), init);
  const token = getAccessToken();

  const firstResponse = await fetch(withAuth(request.clone(), token), {
    credentials: "include",
  });

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return firstResponse;
  }

  return fetch(withAuth(request.clone(), refreshedToken), {
    credentials: "include",
  });
}

export async function loginWithEmail(email: string, password: string) {
  const response = await fetch(resolveUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const payload = (await response.json()) as AuthTokensResponse;
  if (payload.access_token) {
    setTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      tokenType: payload.token_type,
    });
  }

  return payload;
}

export async function logout() {
  clearTokens();
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await apiFetch("/auth/me", { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to load profile");
  }
  return (await response.json()) as AuthUser;
}
