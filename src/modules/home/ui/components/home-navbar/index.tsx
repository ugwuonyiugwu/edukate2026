"use client"
import { SignedIn, UserButton } from '@clerk/nextjs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GraduationCap } from 'lucide-react' // Example Logo icon

interface NavbarProps {
  activeTitle: string;
}

export function HomeNavbar({ activeTitle }: NavbarProps) {
  return (
    <nav className="flex h-16 items-center justify-between w-full px-4 md:px-8 bg-blue-600 text-white fixed top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <SidebarTrigger className="md:hidden mr-2" />
        
        {/* Logo */}
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <GraduationCap className="h-6 w-6 text-blue-600" />
        </div>
        
        {/* Dynamic Title */}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
          {activeTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
        </SignedIn>
      </div>
    </nav>
  )
}