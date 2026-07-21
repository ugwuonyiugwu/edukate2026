import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { QuizQuestionsView } from "@/modules/Admin/AdminQuizathon/Components/QuestionView";
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quizId = Number(id);

  await trpc.userquizathon.getLatestEvent.prefetch();

  return (
    
      <HydrateClient>
        <Suspense fallback={<LoadingSpinner />}>
          <QuizQuestionsView quizId={quizId} />
        </Suspense>
      </HydrateClient>
    
  );
}