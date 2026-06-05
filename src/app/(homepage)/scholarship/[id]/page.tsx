import { HydrateClient, trpc } from "@/trpc/server"; // Ensure trpc is imported
import { Suspense } from "react";
import { ScholarshipDetailContent } from "@/modules/home/Scholarship/Descriptionview";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

// 1. Change to async and define Props
export default async function ScholarshipPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. Await the params
  const { id } = await params;
  const scholarshipId = parseInt(id);

  // 3. Prefetch
  void trpc.scholarship.getById.prefetch({ id: scholarshipId });

  return (
    <HydrateClient>
      <main className="max-w-3xl mx-auto p-6 py-12">
        <Suspense fallback={<LoadingSpinner/>}>
          <ScholarshipDetailContent id={scholarshipId} />
        </Suspense>
      </main>
    </HydrateClient>
  );
}