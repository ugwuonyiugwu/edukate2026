import { Suspense } from "react";
import { HydrateClient, trpc } from "@/trpc/server"; 
import { LiveExamPortal } from "@/modules/home/Quizathon/quizexam";
import { Loader2, ShieldAlert } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function QuizDashboardPage() {
  try {
    await trpc.userquizathon.getLiveExamQuestions.prefetch();
    await trpc.userquizathon.getUserRegistrations.prefetch();

    const [examPayload, userRegistrations] = await Promise.all([
      trpc.userquizathon.getLiveExamQuestions(),
      trpc.userquizathon.getUserRegistrations(),
    ]);

    const { categorizedQuestions, secondsRemaining } = examPayload ?? {
      categorizedQuestions: {},
      secondsRemaining: 0,
    };
    const activeRegistration = userRegistrations?.[0];
    const registeredSubjects = activeRegistration?.selectedSubjects ?? [];
    const quizEventId = activeRegistration?.id ?? 0;

    return (
      <HydrateClient>
        <Suspense fallback={"Loadind.."}>
          <LiveExamPortal 
            quizEventId={quizEventId}
            initialSecondsRemaining={secondsRemaining}
            registeredSubjects={registeredSubjects}
            categorizedQuestions={categorizedQuestions}
          />
        </Suspense>
      </HydrateClient>
    );

  } catch (error: any) {
    const errorMessage = error?.message || "The examination link cannot be reached.";
    const isLocked = errorMessage.toLowerCase().includes("lock") || errorMessage.toLowerCase().includes("not arrived");

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full p-8 bg-white border border-slate-100 rounded-3xl shadow-xl flex flex-col items-center space-y-5">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1.5">
              {isLocked ? "Portal Locked" : "Access Expired"}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              {errorMessage}
            </p>
          </div>
          <a
            href="/quizathon"
            className="w-full inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
}

// ... rest of your code