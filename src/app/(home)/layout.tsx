import { AppSidebar } from "@/components/app-sidebar";
import { DatePicker } from "@/components/date-picker";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider } from "@/contexts/filter.context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppProvider>
        <AppSidebar />
        <main className="grid min-h-screen flex-1 grid-rows-[20px_1fr_150px] p-5">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="size-7 [&>svg]:size-4!" />
            <Separator orientation="vertical" />
            <DatePicker />
          </div>
          {children}
          <footer className="flex flex-wrap items-end-safe justify-start gap-x-[24px] pb-5">
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
      </AppProvider>
    </SidebarProvider>
  );
}
