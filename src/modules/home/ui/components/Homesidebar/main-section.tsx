"use client"

import { SidebarGroup, 
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Bell, GraduationCap, LayoutDashboard,  School, Trophy, User2Icon } from "lucide-react"
import Link  from "next/link"
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Profile",
    url: "/User Profile",
    icon: User2Icon,
  },
  {
    title: "Quizathon",
    url: "/Quizathon",
    icon: Trophy,
  },
  {
    title: "Scholarship",
    url: "/Scholarship",
    icon: GraduationCap,
  },
  {
    title: "Class",
    url: "/Class",
    icon: School,
  },
  {
    title: "Notification",
    url: "/Notification",
    icon: Bell,
  },
];

export const MainSection = () => {
  return (
  <SidebarGroup>
    <SidebarGroupContent> 
      <SidebarMenu  className="bg- max-h-screen flex">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              tooltip={item.title}
              asChild
              isActive={false}
            >
              <Link href={item.url} className="flex items-center gap-4">
               <item.icon />
               <span className="text-sm">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <div className="flex-1 bg-amber-600"></div>

        <div>Logout</div>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  )
}

