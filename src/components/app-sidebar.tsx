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
  ChevronLeft,
  ChevronRight,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { companyNewsBySection } from "./constants";
import { ForwardRefExoticComponent, RefAttributes, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { downloadSectionsAsCSV } from "@/lib/utils";
import { SidebarDatePicker } from "@/components/date-picker";

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

function TruncatedTooltip({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncate = () => {
    if (!ref.current) return;
    setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span ref={ref} className="truncate" onMouseEnter={checkTruncate} onFocus={checkTruncate}>
          {text}
        </span>
      </TooltipTrigger>
      {isTruncated ? (
        <TooltipContent side="right" align="center">
          {text}
        </TooltipContent>
      ) : null}
    </Tooltip>
  );
}

export function AppSidebar() {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

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
          <SidebarDatePicker collapsed={state === "collapsed"} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu className="flex flex-col gap-3">
            {(Object.keys(companyNewsBySection) as (keyof typeof companyNewsBySection)[]).map(
              (item, index) => {
                return (
                  <SidebarMenuItem key={index}>
                    {state === "collapsed" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="text-sidebar-foreground text-base">
                            <Link
                              href="/"
                              className="flex min-w-0 justify-center text-center"
                              onClick={(event) => {
                                localStorage.setItem("home_section", item);
                              if (pathname === "/") {
                                event.preventDefault();
                                requestAnimationFrame(() => {
                                  const target = document.getElementById(item);
                                  if (target) {
                                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                });
                              } else {
                                router.push("/");
                              }
                              if (isMobile) {
                                setOpenMobile(false);
                              }
                            }}
                          >
                              <span className="flex w-full items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </span>

                              <span className="truncate">{companyNewsBySection[item].topic}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {companyNewsBySection[item].topic}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild className="text-sidebar-foreground text-base">
                        <Link
                          href="/"
                          className="min-w-0"
                          onClick={(event) => {
                            localStorage.setItem("home_section", item);
                              if (pathname === "/") {
                                event.preventDefault();
                                requestAnimationFrame(() => {
                                  const target = document.getElementById(item);
                                  if (target) {
                                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                });
                              } else {
                                router.push("/");
                              }
                              if (isMobile) {
                                setOpenMobile(false);
                              }
                            }}
                          >
                          <span className="text-sm font-semibold">{index + 1}</span>
                          <TruncatedTooltip text={companyNewsBySection[item].topic} />
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              }
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu className="pt-4">
            <SidebarMenuItem>
              {state === "collapsed" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className="text-sidebar-foreground text-base"
                      onClick={() => downloadSectionsAsCSV(companyNewsBySection)}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <Download size={32} />
                      </div>
                      <span className="truncate">Скачать</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Скачать
                  </TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton
                  className="text-sidebar-foreground text-base"
                  onClick={() => downloadSectionsAsCSV(companyNewsBySection)}
                >
                  <div className="flex size-4 items-center justify-center">
                    <Download size={32} />
                  </div>
                  <TruncatedTooltip text="Скачать" />
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
            <SidebarMenuItem>
              {state === "collapsed" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className="text-sidebar-foreground text-base"
                      onClick={toggleSidebar}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ChevronRight size={20} />
                      </div>
                      <span className="truncate">Показать меню</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Показать меню
                  </TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton
                  className="text-sidebar-foreground text-base"
                  onClick={toggleSidebar}
                >
                  <div className="flex size-4 items-center justify-center">
                    <ChevronLeft size={20} />
                  </div>
                  <TruncatedTooltip text="Скрыть меню" />
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
