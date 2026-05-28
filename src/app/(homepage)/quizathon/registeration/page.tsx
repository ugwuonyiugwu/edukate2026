// app/quizathon/register/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { SubjectSelectionForm } from "@/modules/home/Quizathon/quizRegistration";
import { Suspense } from "react";

export default async function RegistrationPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={<div className="text-center font-medium text-slate-500 animate-pulse">Loading subjects...</div>}>
            <SubjectSelectionForm />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}