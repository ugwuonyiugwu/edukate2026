import { LibraryLayout } from '@/modules/Library/ui/layouts/Library-layout'
import React from 'react'

interface LibraryLayoutProps{
  children: React.ReactNode;
}

const layout = ({children}:LibraryLayoutProps) => {
  return (
    <LibraryLayout>
      {children}
    </LibraryLayout>
      
    
  )
}

export default layout
