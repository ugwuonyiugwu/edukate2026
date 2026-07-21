"use client";

import { 
  LayoutDashboard, User, Library, Trophy, GraduationCap, 
  Bell, LogOut, School, Presentation, ShieldCheck, ArrowLeftRight,
  User2Icon,
  Users2Icon,
  School2,
  Settings,
  UserPlus,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, useSidebar, // Import useSidebar
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

interface HomeSidebarProps {
  activeTitle: string;
  setActiveTitle: (title: string) => void;
  role?: string | null;         
  realRole?: string | null;     
  onToggleMode?: () => void;
  isViewingAsUser?: boolean;
}

const userNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "User Profile", icon: User, url: "/profile" },
  { title: "Library", icon: Library, url: "/libraries" },
  { title: "QuizGrid", icon: Trophy, url: "/quizgrid" },
  { title: "Scholarship", icon: GraduationCap, url: "/scholarship" },
  { title: "Notification", icon: Bell, url: "/notifications" },
  { title: "Class", icon: School, url: "/classes" },
  { title: "Quizathon", icon: Trophy, url: "/quizathon" },
  { title: "Teachers", icon: Presentation, url: "/teachers" },
  { title: "Referral", icon: UserPlus, url: "/referal" },
];

const adminNavItems = [
  { title: "Dashboard", icon: ShieldCheck, url: "/admin/dashboard" },
  { title: "Quizathon", icon: Trophy, url: "/admin/quizathon" },
  { title: "Teachers", icon: Presentation, url: "/admin/teachers" },
  { title: "Scholarship", icon: GraduationCap, url: "/admin/scholarship" },
  { title: "Classes", icon: School2, url: "/admin/classes" },
  { title: "Upgrade user", icon: User2Icon, url: "/admin/userupgrade" },
  { title: "Users", icon: Users2Icon, url: "/admin/users" },
  { title: "Setting", icon: Settings, url: "/admin/setting" },
  { title: "Notification", icon: Bell, url: "/admin/notification" },
];

export const HomeSidebar = ({ 
  setActiveTitle, 
  activeTitle, 
  role,
  realRole,
  onToggleMode, 
  isViewingAsUser 
}: HomeSidebarProps) => {
  
  const currentNav = (role === 'admin' && !isViewingAsUser) ? adminNavItems : userNavItems;
  
  // Destructure isMobile and setOpenMobile from the sidebar context
  const { isMobile, setOpenMobile } = useSidebar();

  const handleItemClick = (title: string) => {
    setActiveTitle(title);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r-2 border-blue-500 bg-[#121212] text-zinc-500 z-50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={35} height={35} />
          <span className="font-bold text-xl text-blue-700 tracking-tight">
            {role === 'admin' && !isViewingAsUser ? 'Edukate' : 'EduKate'}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5"> 
              {currentNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    onClick={() => handleItemClick(item.title)}
                    isActive={activeTitle === item.title}
                    className="py-5 font-medium text-md transition-all rounded-none hover:bg-zinc-800 hover:text-zinc-200 data-[active=true]:bg-zinc-900 data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <div className="flex items-center w-full"> 
                        <item.icon className={`h-6 w-6 mr-9 ${activeTitle === item.title ? 'text-blue-500' : 'text-zinc-400'}`} />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-zinc-900">
        <SidebarMenu>
          {realRole === 'admin' && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => {
                  onToggleMode?.();
                  if (isMobile) setOpenMobile(false);
                }}
                className="mb-2 py-5 text-amber-500 hover:bg-amber-950/20 transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                <span>
                  {isViewingAsUser ? "Switch to Admin Mode" : "Switch to User Mode"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton className="py-3 text-zinc-600 hover:bg-red-950/20 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              <SignOutButton>
                <span>Log out</span>
              </SignOutButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};