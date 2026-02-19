"use client"
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react'
import { HomeNavbar } from '../components/home-navbar';
import { HomeSidebar } from '../components/Homesidebar';

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const [activeTitle, setActiveTitle] = useState("Dashboard");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        {/* Pass title and setter to components */}
        <HomeNavbar activeTitle={activeTitle} />
        
        <div className="flex flex-1 pt-16"> {/* pt-16 accounts for fixed navbar */}
          <HomeSidebar setActiveTitle={setActiveTitle} activeTitle={activeTitle} />
          <SidebarInset className="flex-1 overflow-x-hidden">
            <main className="p-4 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}