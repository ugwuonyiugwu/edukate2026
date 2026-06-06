import { trpc, HydrateClient } from "@/trpc/server";
import { UserTable } from "@/modules/Admin/Users/UsersTable";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  void trpc.admin.getUsers.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <UserTable />
      </Suspense>
    </HydrateClient>
  );
}