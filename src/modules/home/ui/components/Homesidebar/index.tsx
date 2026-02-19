"use client"

import { LayoutDashboard, User, Library, Trophy, GraduationCap, Bell, LifeBuoy, LogOut, School } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface HomeSidebarProps {
  activeTitle: string;
  setActiveTitle: (title: string) => void;
}

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "User Profile", icon: User },
  { title: "Library", icon: Library },
  { title: "Quizathon", icon: Trophy },
  { title: "Scholarship", icon: GraduationCap },
  { title: "Notification", icon: Bell },
  { title: "Class", icon: School },
]

export const HomeSidebar = ({ setActiveTitle, activeTitle }: HomeSidebarProps) => {
  return (
   <Sidebar className="border-r pt-16"> {/* pt-16 so items start below navbar */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTitle(item.title)}
                    isActive={activeTitle === item.title}
                    className="py-6 text-md transition-all hover:bg-blue-50 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600"
                  >
                    <item.icon className={`h-5 w-5 mr-2 ${activeTitle === item.title ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-8">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="py-4 text-slate-500"><LifeBuoy /><span>Help/Support</span></SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="py-4 text-slate-500"><LogOut /><span>Log out</span></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}