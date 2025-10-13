"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { LayoutDashboard, FolderKanban, Scissors, Users, Settings, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/projects", label: "Projekte", icon: FolderKanban },
  { href: "/patterns", label: "Schnittmuster", icon: Scissors },
  { href: "/creators", label: "Designer", icon: Users },
];

const adminMenuItem = { href: "/admin", label: "Verwaltung", icon: Cog };

export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <Icons.Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={{
                  children: label,
                  className: "font-headline"
                }}
                className={cn(pathname === href && "font-bold")}
              >
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === adminMenuItem.href}
                tooltip={{
                  children: adminMenuItem.label,
                  className: "font-headline"
                }}
                className={cn(pathname === adminMenuItem.href && "font-bold")}
              >
                <Link href={adminMenuItem.href}>
                  <adminMenuItem.icon />
                  <span>{adminMenuItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: "Einstellungen", className: "font-headline"}}>
                    <Settings />
                    <span>Einstellungen</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
