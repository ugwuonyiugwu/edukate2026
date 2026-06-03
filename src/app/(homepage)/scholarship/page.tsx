export const dynamic = "force-dynamic"

import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ScholarshipFeed } from "@/modules/home/Scholarship/scholarshipview";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default async function Page() {
  void trpc.scholarship.getAllAdmin.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        <Suspense fallback={<LoadingSpinner/>}>
          <ScholarshipFeed />
        </Suspense>
      </div>
    </HydrateClient>
  );
}