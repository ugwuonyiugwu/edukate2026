import { QuizQuestionsView } from "@/modules/Admin/AdminQuizathon/Components/QuestionView";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quizId = Number(id);

  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSpinner/>}>
        <QuizQuestionsView quizId={quizId} />
      </Suspense>
    </main>
  );
}
