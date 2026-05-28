import { QuizQuestionsView } from "@/modules/Admin/AdminQuizathon/Components/QuestionView";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quizId = Number(id);

  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<AdminLoadingState />}>
        <QuizQuestionsView quizId={quizId} />
      </Suspense>
    </main>
  );
}

function AdminLoadingState() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Fetching Data
        </p>
        <p className="text-xs font-bold text-slate-300">Opening Question Bank...</p>
      </div>
    </div>
  );
}