import DiscoveryPage from '@/modules/home/Libraries/library'
import { LoadingSpinner } from '@/modules/home/ui/components/Logospinal';
import { trpc, HydrateClient } from '@/trpc/server'
import { Suspense } from 'react';


export const dynamic = 'force-dynamic';

export default async function LibrariesPage () { 
  
  void trpc.documents.getAllLibraries.prefetch();
  void trpc.users.getOne.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <DiscoveryPage/>
      </Suspense>
    </HydrateClient>
  )
};
