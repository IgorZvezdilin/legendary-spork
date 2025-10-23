"use client";
import {
  Activity,
  Gavel,
  MessageCircle,
  Users,
  Cpu,
  Home,
  ShoppingCart,
  Heart,
  DollarSign,
  LucideProps,
  Trees,
  Icon,
  Download,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { companyNewsBySection } from "./constants";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { downloadSectionsAsCSV } from "@/lib/utils";

const topicIcons: Record<
  keyof typeof companyNewsBySection,
  ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
> = {
  economy: Activity, // general economy / growth
  regulation: Gavel, // law / government regulation
  key_messages: MessageCircle, // communications / announcements
  competitors: Users, // competitors / market players
  technology: Cpu, // tech / AI / IoT
  commercial_real_estate: Home, // real estate / buildings
  e_commerce: ShoppingCart, // online shopping
  social_responsibility: Heart, // social responsibility / charity
  investments_finance: DollarSign, // finance / investments
};

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex flex-row flex-nowrap items-center gap-2">
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
          <SidebarMenu className="flex flex-col gap-3">
            {(Object.keys(companyNewsBySection) as (keyof typeof companyNewsBySection)[]).map(
              (item, index) => {
                const Icon = topicIcons[item];
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild className="text-base text-white">
                      <Link href={item}>
                        <div className="flex size-4 items-center justify-center">
                          <Icon size={32} />
                        </div>
                        <span>{companyNewsBySection[item].topic}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu className="pt-4">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-base text-white"
                onClick={() => downloadSectionsAsCSV(companyNewsBySection)}
              >
                <div className="flex size-4 items-center justify-center">
                  <Download size={32} />
                </div>
                <span>Скачать</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
