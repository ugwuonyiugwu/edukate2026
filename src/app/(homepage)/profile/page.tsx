// app/profile/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { ProfileForm } from "@/modules/home/Profile/profile";

export default async function ProfilePage() {
  // This starts fetching on the server immediately
  void trpc.users.getOne.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50 py-12">
        <ProfileForm />
      </main>
    </HydrateClient>
  );
}