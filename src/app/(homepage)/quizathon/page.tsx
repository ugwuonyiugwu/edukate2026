// @/app/registration/page.tsx
import { Suspense } from 'react';
import { trpc, HydrateClient } from "@/trpc/server";
import { QuizContent } from '@/modules/home/Quizathon/quizcontent';
import { LoadingSpinner } from '@/modules/home/ui/components/Logospinal';

export const dynamic = 'force-dynamic';

export default async function MonthlyRegistrationPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-slate-50 mt-10 flex items-start justify-center p-1">
        <Suspense fallback={<LoadingSpinner/>}>
          <QuizContent />
        </Suspense>
      </div>
    </HydrateClient>
  );
}