"use client";

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 1. Import useRouter
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
  const router = useRouter(); // 2. Initialize router

  useEffect(() => {
    const savedMode = localStorage.getItem("viewMode");
    if (savedMode === "user") {
      setViewAsUser(true);
    }
    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    const newMode = !viewAsUser; // If true, we are switching to User Mode
    setViewAsUser(newMode);
    localStorage.setItem("viewMode", newMode ? "user" : "admin");

    // 3. Perform the redirect based on the new mode
    if (newMode) {
      router.push("/dashboard");
    } else {
      router.push("/admin");
    }
  };

  if (!isMounted) return null;
  
  const effectiveRole = viewAsUser ? 'user' : role;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <HomeSidebar 
          setActiveTitle={setActiveTitle} 
          activeTitle={activeTitle} 
          role={effectiveRole}      
          realRole={role}           
          onToggleMode={toggleMode} 
          isViewingAsUser={viewAsUser} 
        />
        
        <SidebarInset className="flex flex-col flex-1">
          <HomeNavbar activeTitle={activeTitle} />
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};