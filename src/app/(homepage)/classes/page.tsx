import { HydrateClient, trpc } from "@/trpc/server";
import { ClassEnrollmentGrid } from "@/modules/home/Classes/Class";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";


export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  await trpc.classes.getAll.prefetch({});

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <main className="min-h-screen bg-[#F8FAFC]">
          <ClassEnrollmentGrid />
        </main>
      </Suspense>
    </HydrateClient>
  );
}