import { trpc, HydrateClient } from "@/trpc/server"; // Your existing imports
import { AdminDashboardView } from "@/modules/Admin/Dashboard/Admindashboard";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  void trpc.admin.getDashboardStats.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <AdminDashboardView />
      </Suspense>
    </HydrateClient>
  );
}