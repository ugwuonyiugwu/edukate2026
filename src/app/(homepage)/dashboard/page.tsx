import { DashboardView } from "@/modules/home/Dashboard";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const Page = async () => {
  // 1. Await only the critical data required for the initial paint.
  // Using 'await' ensures the server processes this before attempting to hydrate.
  await trpc.users.getOne.prefetch();

  // 2. We remove the document prefetches from the server.
  // These will now trigger automatically via 'useQuery' inside <DashboardView />.
  // This staggers the requests, preventing the concurrency limit burst.

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <DashboardView />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;