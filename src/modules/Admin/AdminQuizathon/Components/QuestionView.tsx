'use client';

import { trpc } from "@/trpc/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionTable } from "./QuestionTable";
import { QuestionForm } from "./QuestionForm";

export function QuizQuestionsView({ quizId }: { quizId: number }) {
  const [quiz] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();

  if (!quiz) {
    return (
      <div className="p-10 sm:p-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs sm:text-sm">
        No active quiz found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/admin/quizathon" className="shrink-0 mt-1 sm:mt-0">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-slate-50 border-slate-200 shadow-sm">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight truncate">{quiz.title}</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-1">
              Question Bank Manager
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 sm:px-5 py-2 bg-slate-50 rounded-sm border border-slate-100 shadow-inner w-full md:w-auto justify-center md:justify-start">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
            {quiz.subjects.length} Subjects Active
          </span>
        </div>
      </header>

      {/* Navigation & Content */}
      <Tabs defaultValue={quiz.subjects[0]} className="space-y-6 sm:space-y-10">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-sm h-auto border border-slate-200/60 shadow-sm inline-flex w-full sm:w-auto min-w-full sm:min-w-0">
            {quiz.subjects.map((subject) => (
              <TabsTrigger 
                key={subject} 
                value={subject}
                className="rounded-sm px-6 sm:px-10 py-2.5 sm:py-3 font-black data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 uppercase text-[10px] sm:text-[11px] tracking-widest transition-all shrink-0 flex-1 sm:flex-initial text-center"
              >
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {quiz.subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-4 sm:space-y-6 outline-none">
            {/* Subject Context Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">{subject.replace(/_/g, " ")} Content</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Add, edit, or remove questions from the {subject.replace(/_/g, " ")} pool.</p>
              </div>

              <div className="w-full sm:w-auto">
                <QuestionForm quizId={quizId} subject={subject} />
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-xl shadow-slate-100 overflow-hidden">
              <QuestionTable quizId={quizId} subject={subject} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}