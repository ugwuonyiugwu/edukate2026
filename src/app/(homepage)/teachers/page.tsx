export const dynamic = "force-dynamic";

import { TeacherView } from "@/modules/home/Teachersview";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default function TeachersPage() {
  return (
    <main className="min-h-screen bg-slate-50/30">
      <Suspense fallback={<LoadingSpinner/>}>
        <TeacherView />
      </Suspense>
    </main>
  );
}