import { DashboardView } from "@/modules/home/Dashboard";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const Page = async () => {
  await Promise.all([
    trpc.users.getOne.prefetch(),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <DashboardView />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;