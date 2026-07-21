import { trpc, HydrateClient } from "@/trpc/server";
import { UserProfileView } from "@/modules/home/Profile/Users-profile";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ clerkId: string }>;
};

export default async function AdminUserPage({ params }: Props) {
  const { clerkId } = await params;
  const viewer = await trpc.users.getOne();
  if (!viewer) return notFound();

  if (viewer.role === 'admin') {
    void trpc.users.getByIdAdmin.prefetch({ clerkId });
  } else {
    void trpc.users.getPublicProfile.prefetch({ clerkId });
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <UserProfileView 
            clerkId={clerkId} 
            viewerRole={viewer.role} 
          />
        </div>
      </main>
    </HydrateClient>
  );
}