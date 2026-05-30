import { trpc, HydrateClient } from "@/trpc/server";
import { AdminQuizClient } from "@/modules/Admin/AdminQuizathon/AdminQuizclient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminQuizPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();
  void trpc.adminquizathon.getRegistrations.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="font-medium">Loading Dashboard...</p>
        </div>
      }>
        <AdminQuizClient />
      </Suspense>
    </HydrateClient>
  );
}