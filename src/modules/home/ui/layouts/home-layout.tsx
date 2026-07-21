"use client";

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomeNavbar } from '../components/home-navbar';
import { HomeSidebar } from '../components/Homesidebar';
import { MessageCircle } from 'lucide-react'; // Using Lucide icon for WhatsApp/Chat
import { SiWhatsapp } from 'react-icons/si';

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
      <div className="flex min-h-screen w-full bg-slate-50/50 overflow-x-hidden relative">
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
          <main className="flex-1 bg-zinc-50 pt-16 min-w-0 w-full">
            {children}
          </main>
        </SidebarInset>

        <a
          href="https://wa.me/08129156454" 
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact support on WhatsApp"
          className="fixed bottom-10 right-10 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
        >
          <SiWhatsapp className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
        </a>
      </div>
    </SidebarProvider>
  );
};