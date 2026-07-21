// src/app/(homepage)/quizathon/[quizId]/submit/page.tsx
import { HydrateClient, trpc } from "@/trpc/server"; 
import { SubmissionView } from "@/modules/home/QuizGrid/Quizviews/SubmissionView";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

// Note: Ensure the type matches that params is a Promise
export default async function SubmissionPage({ 
  params 
}: { 
  params: Promise<{ quizId: string }> 
}) {
  // 1. Await the params to get the actual ID
  const { quizId } = await params;

  // 2. Start prefetching with the validated ID
  // The 'void' starts the fetch on the server background
  void trpc.quiz.getOne.prefetch({ id: quizId });

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <SubmissionView quizId={quizId} />
      </Suspense>
    </HydrateClient>
  );
}