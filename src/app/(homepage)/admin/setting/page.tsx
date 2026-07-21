// src/app/dashboard/page.tsx
import { AnnouncementManager } from "@/modules/Admin/Advertizement/Settings";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { trpc } from "@/trpc/server"; // Server-side trpc instance
import { HydrateClient } from "@/trpc/server"; 
import { Suspense } from "react";

export default async function DashboardPage() {
  await trpc.settings.getAnnouncement.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <AnnouncementManager />
      </Suspense>
    </HydrateClient>
  );
}