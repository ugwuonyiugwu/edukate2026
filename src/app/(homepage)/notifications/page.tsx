// src/app/notifications/page.tsx
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { NotificationPage } from "@/modules/home/Notification/notification";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  void trpc.notifications.getMyNotifications.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationPage />
      </Suspense>
    </HydrateClient>
  );
}