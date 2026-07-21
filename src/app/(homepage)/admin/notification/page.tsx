// src/app/admin/notifications/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { AdminNotificationView } from "@/modules/Admin/Notification";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  void trpc.notifications.getUsers.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner />}>
        <AdminNotificationView />
      </Suspense>
    </HydrateClient>
  );
}