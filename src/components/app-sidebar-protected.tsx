"use client";

import Link from "next/link";
import { Building2, Newspaper, Trees } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarDatePicker } from "@/components/date-picker";

export function ProtectedAppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/news" className="flex flex-row flex-nowrap items-center gap-2">
          <div className="flex size-12 items-center justify-center">
            <Trees size={32} color="green" />
          </div>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              state === "expanded" ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <p className="text-base font-semibold whitespace-nowrap opacity-100">EcoTech Group</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <div className="px-2">
            <SidebarDatePicker collapsed={state === "collapsed"} />
          </div>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu className="flex flex-col gap-3">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base text-sidebar-foreground">
                <Link
                  href="/companies"
                  className="min-w-0"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <div className="flex size-4 items-center justify-center">
                    <Building2 size={32} />
                  </div>
                  <span className="truncate" title="Кампании">
                    Кампании
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base text-sidebar-foreground">
                <Link
                  href="/news"
                  className="min-w-0"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <div className="flex size-4 items-center justify-center">
                    <Newspaper size={32} />
                  </div>
                  <span className="truncate" title="Новости">
                    Новости
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
