"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
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

interface HomeNavbarProps {
  activeTitle: string;
}

export function HomeNavbar({ activeTitle }: HomeNavbarProps) {
  return (
    <nav className="flex h-16 items-center justify-between w-full px-4 md:px-8 bg-blue-600 border-b border-blue-500 sticky top-0 z-40 shadow-md shadow-black/20">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        <div className="flex items-center justify-center min-w-10 min-h-10">
          <SidebarTrigger className="text-white hover:bg-blue-700 transition-colors" />
        </div>
        
        <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate max-w-45 sm:max-w-none">
          {activeTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8 shrink-0">
        <button className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-blue-600" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none flex items-center gap-2">
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
    </nav>
  )
}