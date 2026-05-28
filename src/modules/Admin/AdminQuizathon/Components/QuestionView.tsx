'use client';

import { trpc } from "@/trpc/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionTable } from "./QuestionTable";
import { QuestionForm } from "./QuestionForm";

export function QuizQuestionsView({ quizId }: { quizId: number }) {
  // ⚡ Updated from trpc.quizathon to trpc.userquizathon to match your appRouter namespaces
  const [quiz] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();

  if (!quiz) {
    return (
      <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">
        No active quiz found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/admin/quizathon">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-slate-50 border-slate-200 shadow-sm">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{quiz.title}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-1">
              Question Bank Manager
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-5 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
            {quiz.subjects.length} Subjects Active
          </span>
        </div>
      </header>

      {/* Navigation & Content */}
      <Tabs defaultValue={quiz.subjects[0]} className="space-y-10">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-sm h-auto border border-slate-200/60 shadow-sm">
          {quiz.subjects.map((subject) => (
            <TabsTrigger 
              key={subject} 
              value={subject}
              className="rounded-sm px-10 py-3 font-black data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 uppercase text-[11px] tracking-widest transition-all"
            >
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {quiz.subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-6 outline-none">
            {/* Subject Context Bar */}
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 capitalize">{subject.replace(/_/g, " ")} Content</h2>
                <p className="text-xs font-bold text-slate-400">Add, edit, or remove questions from the {subject.replace(/_/g, " ")} pool.</p>
              </div>

              <QuestionForm quizId={quizId} subject={subject} />
            </div>

            <div className="bg-white rounded-sm border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
              <QuestionTable quizId={quizId} subject={subject} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}