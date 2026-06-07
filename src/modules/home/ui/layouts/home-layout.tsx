"use client";

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomeNavbar } from '../components/home-navbar';
import { HomeSidebar } from '../components/Homesidebar';

interface HomeLayoutProps {
  children: React.ReactNode;
  role?: string | null;
}

export const HomeLayout = ({ children, role }: HomeLayoutProps) => {
  const [activeTitle, setActiveTitle] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem("viewMode");
    if (savedMode === "user") {
      setViewAsUser(true);
    }
    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    const newMode = !viewAsUser;
    setViewAsUser(newMode);
    localStorage.setItem("viewMode", newMode ? "user" : "admin");

    if (newMode) {
      router.push("/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  };

  if (!isMounted) return null;
  
  const effectiveRole = viewAsUser ? 'user' : role;

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Added overflow-x-hidden to act as a final safety net for the viewport */}
      <div className="flex min-h-screen w-full bg-slate-50/50 overflow-x-hidden">
        <HomeSidebar 
          setActiveTitle={setActiveTitle} 
          activeTitle={activeTitle} 
          role={effectiveRole}      
          realRole={role}           
          onToggleMode={toggleMode} 
          isViewingAsUser={viewAsUser} 
        />
        
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <HomeNavbar activeTitle={activeTitle} />
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};