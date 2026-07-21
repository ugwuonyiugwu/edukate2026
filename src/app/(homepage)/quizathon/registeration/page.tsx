// app/quizathon/register/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { SubjectSelectionForm } from "@/modules/home/Quizathon/quizRegistration";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function RegistrationPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();

  return (
    <HydrateClient>       
          <Suspense fallback={<LoadingSpinner/>}>
            <SubjectSelectionForm />
          </Suspense>
    </HydrateClient>
  );
}