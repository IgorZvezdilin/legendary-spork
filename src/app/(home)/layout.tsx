import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider } from "@/contexts/filter.context";
import { HeaderSearch } from "@/components/header-search";
import { HeaderFilters } from "@/components/header-filters";
import { DatePicker } from "@/components/date-picker";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard publicPaths={["/"]} allowSingleSegment>
      <SidebarProvider>
        <AppProvider>
          <AppSidebar />
          <main className="flex min-h-screen flex-1 flex-col p-5">
            <div className="from-background/90 sticky top-0 z-10 bg-linear-to-b to-transparent pt-2 pb-2">
              <div className="flex items-start">
                <SidebarTrigger className="hidden max-[768px]:inline-flex" />
                <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 max-[720px]:gap-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <HeaderFilters />
                    <DatePicker />
                  </div>
                  <div className="max-[720px]:order-2 max-[720px]:flex max-[720px]:basis-full max-[720px]:items-center max-[720px]:justify-center">
                    <HeaderSearch />
                  </div>
                </div>
              </div>
            </div>
            {children}
            <footer className="flex flex-wrap items-end-safe justify-start gap-x-6 pb-5">
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href=""
                target="_blank"
                rel="noopener noreferrer"
              >
                Методология
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="mailto:method@example.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                method@example.com
              </a>
            </footer>
          </main>
        </AppProvider>
      </SidebarProvider>
    </AuthGuard>
  );
}
