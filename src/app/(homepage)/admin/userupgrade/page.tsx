export const dynamic = "force-dynamic";

import { UserRoleManager } from "@/modules/Admin/UsersManagement/UpgradeUser/UserRoleManagement";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default function AdminUserManagementPage() {
  return (
      <Suspense fallback={<LoadingSpinner />}>
        <UserRoleManager />
      </Suspense>
  );
}