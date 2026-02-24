"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens, fetchMe, getAccessToken } from "@/lib/auth";

function isPublicPath(
  pathname: string,
  publicPaths: string[],
  allowSingleSegment: boolean
) {
  if (publicPaths.includes(pathname)) return true;
  if (!allowSingleSegment) return false;

  const normalized = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return normalized.length > 0 && !normalized.includes("/");
}

export function AuthGuard({
  children,
  publicPaths = [],
  allowSingleSegment = false,
}: {
  children: React.ReactNode;
  publicPaths?: string[];
  allowSingleSegment?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (isPublicPath(pathname, publicPaths, allowSingleSegment)) {
        if (isMounted) setIsReady(true);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        await fetchMe();
        if (isMounted) setIsReady(true);
      } catch (error) {
        clearTokens();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Проверка доступа...</p>
      </div>
    );
  }

  return <>{children}</>;
}
