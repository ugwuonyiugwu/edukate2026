import { LoadingSpinner } from '@/modules/home/ui/components/Logospinal'
import { LibraryPage } from '@/modules/Library'
import { HydrateClient } from '@/trpc/server'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
       <LibraryPage/>
      </Suspense>
    </HydrateClient>
   
  )
}

export default page
