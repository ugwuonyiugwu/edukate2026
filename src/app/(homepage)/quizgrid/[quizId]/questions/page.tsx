// app/quiz/[quizId]/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { QuizSessionView } from "@/modules/home/QuizGrid/Quizviews/QuizSessionView";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const { quizId } = await params;

  // 1. Prefetch the data on the server
  void trpc.quiz.getQuizQuestions.prefetch({ quizId });

  // 2. Wrap the component with HydrateClient
  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner/>}>
        <QuizSessionView quizId={quizId} />
      </Suspense>
    </HydrateClient>
  );
}