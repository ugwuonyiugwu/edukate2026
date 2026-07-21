// app/profile/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { ProfileForm } from "@/modules/home/Profile/profile";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  void trpc.users.getOne.prefetch();

  return (
    <HydrateClient >
       <Suspense fallback={<LoadingSpinner/>}>
        <main className="min-h-screen bg-gray-50 py-12">
          <ProfileForm />
        </main>
      </Suspense>
    </HydrateClient>
  );
}