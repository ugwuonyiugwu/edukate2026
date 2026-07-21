// HomeNavbar.tsx
"use client";

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { UserAvatar } from '@/components/reusableavatar/avatar';
import { Bell, User, Wallet, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

interface HomeNavbarProps {
  activeTitle: string;
}

export function HomeNavbar({ activeTitle }: HomeNavbarProps) {
  const { data: hasUnread } = trpc.notifications.hasUnread.useQuery();
  const utils = trpc.useUtils();
  
  // Read state directly from shadcn sidebar context
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <nav 
      className={`fixed top-0 right-0 h-16 flex items-center bg-blue-600 border-b border-blue-500 z-40 shadow-md transition-all duration-300 ease-in-out ${
        isCollapsed ? "left-0" : "left-0 md:left-64"
      }`}
    >
      <div className="flex items-center justify-between w-full px-4 md:px-8">
        
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <SidebarTrigger className="text-white hover:bg-blue-700 transition-colors" />
          <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate">
            {activeTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 shrink-0 ml-4">
          <Link 
            href="/notifications"
            onMouseEnter={() => utils.notifications.getMyNotifications.prefetch()}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors relative shrink-0"
          >
            <Bell className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute top-1 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-blue-600 animate-pulse" />
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none flex items-center gap-2 shrink-0">
              <UserAvatar />
              <ChevronDown className="h-4 w-4 text-white/70" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/subscription" className="flex items-center gap-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span>Subscription</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-red-500 focus:text-red-500">
                <SignOutButton>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}