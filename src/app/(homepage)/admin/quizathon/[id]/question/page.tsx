import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { QuizQuestionsView } from "@/modules/Admin/AdminQuizathon/Components/QuestionView";
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quizId = Number(id);

  // 1. Prefetch the query on the server
  await trpc.userquizathon.getLatestEvent.prefetch();

  return (
    <main className="min-h-screen bg-white">
      {/* 2. Wrap in HydrateClient to pass the dehydrated state to the client */}
      <HydrateClient>
        <Suspense fallback={<LoadingSpinner />}>
          <QuizQuestionsView quizId={quizId} />
        </Suspense>
      </HydrateClient>
    </main>
  );
}