"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "material-symbols:dashboard",
  },
  {
    label: "Manajemen Berita",
    href: "/admin/articles",
    icon: "material-symbols:article",
  },
  {
    label: "Manajemen User",
    href: "/admin/users",
    icon: "ph:user-list-fill",
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-18 border-b">
        <Image
          src={"/newshub.png"}
          alt="Logo"
          width={200}
          height={200}
          className="mt-[-40px] ml-[-25px]"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <Icon icon={item.icon}/>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={session?.user?.avatar ?? ""} />
            <AvatarFallback>
              {session?.user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </AvatarFallback>
          </Avatar>
          <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-medium">
            {session?.user?.name ?? "Admin"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
