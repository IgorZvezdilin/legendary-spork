import { ProtectedAppSidebar } from "@/components/app-sidebar-protected";
import { AuthGuard } from "@/components/auth-guard";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider } from "@/contexts/filter.context";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppProvider>
        <ProtectedAppSidebar />
        <AuthGuard>
          <main className="flex min-h-screen flex-1 flex-col gap-6 p-5">
            <div className="from-background/90 sticky top-0 z-10 flex h-9 items-center justify-between bg-gradient-to-b to-transparent backdrop-blur">
              <SidebarTrigger className="hidden max-[767px]:inline-flex" />
              <ThemeToggle />
            </div>
            {children}
            <footer className="flex flex-wrap items-end-safe justify-start gap-x-6 pb-5">
              <p>© 2017 - 2025 ПАО «EcoTech Group»</p>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href=""
                target="_blank"
                rel="noopener noreferrer"
              >
                На сайт ECOTECH.RU
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href=""
                target="_blank"
                rel="noopener noreferrer"
              >
                Новости EcoTech в Telegram
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href=""
                target="_blank"
                rel="noopener noreferrer"
              >
                press@ecotech.ru
              </a>
            </footer>
          </main>
        </AuthGuard>
      </AppProvider>
    </SidebarProvider>
  );
}
