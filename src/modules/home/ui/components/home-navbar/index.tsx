"use client"

import Link from 'next/link'
import Image from 'next/image'
import {  SignedIn,  UserButton } from '@clerk/nextjs'
import { SearchInput } from './SearchInput'

export const HomeNavbar = () => {

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-50 flex justify-between items-center px-4 md:px-8 z-50 border-b shadow-md">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-1">
        <Image src="/logo.png" alt="Logo" width={35} height={35} />
        <p className="text-xl font-semibold tracking-tight text-blue-800">EduKate</p>
      </Link>
      <div>
        <SearchInput/>
      </div>
      
     

      <div className="flex items-center gap-4">
        {/* 2. Logic: Show Login if logged out, Show User Avatar if logged in */}
        <div className="hidden md:block">
         
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}