// @/app/registration/page.tsx
import { Suspense } from 'react';
import { trpc, HydrateClient } from "@/trpc/server";
import { QuizContent } from '@/modules/home/Quizathon/quizcontent';
import { QuizSkeleton } from '@/modules/home/Quizathon/quizskeleton';

export default async function MonthlyRegistrationPage() {
  void trpc.userquizathon.getLatestEvent.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Suspense fallback={<QuizSkeleton />}>
          <QuizContent />
        </Suspense>
      </div>
    </HydrateClient>
  );
}