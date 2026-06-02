import { trpc, HydrateClient } from "@/trpc/server";
import { AdminQuizClient } from "@/modules/Admin/AdminQuizathon/AdminQuizclient";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function AdminQuizPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();
  void trpc.adminquizathon.getRegistrations.prefetch();

  return (
    <HydrateClient>
        <Suspense fallback={<LoadingSpinner/>}>
        <AdminQuizClient />
      </Suspense>
    </HydrateClient>
  );
}