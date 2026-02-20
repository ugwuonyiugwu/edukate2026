"use client"

import { 
  LayoutDashboard, 
  User, 
  Library, 
  Trophy, 
  GraduationCap, 
  Bell, 
  LifeBuoy, 
  LogOut, 
  School,
 
} from "lucide-react"
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
} from "@/components/ui/sidebar"
import Image from "next/image";

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
    // bg-[#121212] is a deeper, darker ash. 
    // border-none and shadow-none remove all elevation effects for a flat look.
    <Sidebar className="border-none bg-[#121212] text-zinc-500 z-50 shadow-none">
      
      {/* Sidebar Header with Logo */}
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
         <div>
          <Image src="/logo.png" alt="logo"  width={35} height={35} />
         </div>
          <span className="font-bold text-xl text-blue-700 tracking-tight">
            EduKate
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTitle(item.title)}
                    isActive={activeTitle === item.title}
                    // Hover/Active states use a slightly lighter ash to stand out against the deep bg
                    className="py-6 text-md transition-all rounded-md hover:bg-zinc-400 hover:text-zinc-200 data-[active=true]:bg-zinc-900 data-[active=true]:text-white"
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                      activeTitle === item.title ? 'text-blue-500' : 'text-zinc-600'
                    }`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with a very subtle border for separation */}
      <SidebarFooter className="p-4 border-t border-zinc-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="py-4 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 transition-colors">
              <LifeBuoy className="h-4 w-4 mr-2" />
              <span>Help/Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="py-4 text-zinc-600 hover:bg-red-950/20 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}