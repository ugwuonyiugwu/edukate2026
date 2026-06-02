// src/app/admin/scholarship/page.tsx
export const dynamic = "force-dynamic";

import { ScholarshipManager } from "@/modules/Admin/Scholarship/ScholarshipAdminView";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default function AdminScholarshipPage() {
  return (
    <div className="p-4 sm:p-8">
      <Suspense fallback={<LoadingSpinner/>}>
        <ScholarshipManager />
      </Suspense>
    </div>
  );
}