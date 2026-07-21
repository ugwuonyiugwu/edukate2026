import { HydrateClient, trpc } from "@/trpc/server";
import { AdminClassListView } from "@/modules/Admin/Class/ClassListView";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminAcademyPage() {
  // Prefetching all classes so the list is ready instantly
  void trpc.classes.getAll.prefetch({});

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <div className="p-4 md:p-8 max-w-400 mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black uppercase  text-slate-900 tracking-tight">
              curriculum Management
            </h1>
            <p className="text-slate-500 text-sm font-medium">Configure and deploy curriculum sessions</p>
          </div>
          
          <AdminClassListView />
        </div>
      </Suspense>
    </HydrateClient>
  );
}