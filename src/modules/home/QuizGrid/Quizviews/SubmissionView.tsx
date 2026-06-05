// @/modules/home/Quizzes/views/SubmissionView.tsx
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from "sonner";
import { UploadDropzone } from '@/app/utils/uploadthing';
import { 
  ArrowLeft, Image as ImageIcon, Type, 
  Loader2, Info, Check, Hash, Trash2, Clock 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuestionBuffer {
  questionText: string;
  imageUrl?: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
}

export const SubmissionView = ({ quizId }: { quizId: string }) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionBuffer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Fixes hydration mismatch
  
  const [quiz] = trpc.quiz.getOne.useSuspenseQuery({ id: quizId });

  // Persistence: Load from local storage only on client-side mount
  useEffect(() => {
    const saved = localStorage.getItem(`quiz-buffer-${quizId}`);
    if (saved) {
      try {
        setQuestions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse buffer", e);
      }
    }
    setIsLoaded(true);
  }, [quizId]);

  // Sync to local storage only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`quiz-buffer-${quizId}`, JSON.stringify(questions));
    }
  }, [questions, quizId, isLoaded]);

  // --- LIVE REDIRECT LOGIC ---
  useEffect(() => {
    if (!quiz) return;
    const target = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
    const ticker = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      setMsLeft(Math.max(0, diff));
      if (diff <= 0) {
        clearInterval(ticker);
        router.push(`/quizgrid/${quizId}`);
      }
    }, 1000);
    return () => clearInterval(ticker);
  }, [quiz, quizId, router]);

  const timeString = useMemo(() => {
    if (msLeft === null) return "--:--";
    const m = Math.floor(msLeft / 60000).toString().padStart(2, '0');
    const s = Math.floor((msLeft / 1000) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [msLeft]);

  const bulkSubmitMutation = trpc.quiz.submitAllQuestions.useMutation({
    onSuccess: () => {
      toast.success("All questions submitted!");
      localStorage.removeItem(`quiz-buffer-${quizId}`);
      router.push(`/quizathon/${quizId}`);
    },
    onError: (err) => toast.error(err.message)
  });

  const handleAddQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (questions.length >= 20) return toast.error("Max 20 questions reached");

    const formData = new FormData(e.currentTarget);
    const newQuestion: QuestionBuffer = {
      questionText: formData.get('question') as string,
      imageUrl: imageUrl || undefined,
      correctAnswer: formData.get('correct') as string,
      wrongAnswer1: formData.get('wrong1') as string,
      wrongAnswer2: formData.get('wrong2') as string,
      wrongAnswer3: formData.get('wrong3') as string,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setImageUrl("");
    formRef.current?.reset();
    toast.success(`Question ${questions.length + 1} queued`);
  };

  const handleFinalSubmit = () => {
    // Validation for min 2 characters for math questions
    const invalidQuestions = questions.filter(q => q.questionText.trim().length < 2);
    if (invalidQuestions.length > 0) {
      toast.error("Some questions are too short (min 2 chars).");
      return;
    }

    if (questions.length < 15) {
      toast.error("You need at least 15 questions to finalize.");
      return;
    }

    bulkSubmitMutation.mutate({ quizId, questions });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-400 font-sans antialiased selection:bg-white selection:text-black">
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div className="h-full bg-white transition-all duration-300" style={{ width: `${(questions.length / 20) * 100}%` }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between mb-20">
          <div className="space-y-5">
            <h1 className="text-white text-sm font-medium tracking-tight uppercase">{quiz?.title || "Quiz Studio"}</h1>
            <div className="flex items-center gap-6">
              <p className="text-[15px] text-white font-bold">Queued {questions.length} / 20</p>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Clock size={12} className={msLeft && msLeft < 60000 ? "text-rose-500 animate-pulse" : "text-white"} />
                <span className={`text-[11px] font-black tabular-nums ${msLeft && msLeft < 60000 ? "text-rose-500" : "text-white"}`}>
                  {timeString}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.back()} className="text-white text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="mr-2" size={14}/> Back
          </Button>
        </header>

        <form ref={formRef} onSubmit={handleAddQuestion} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                <Type size={12} /> Input your questions (Max 20)
              </div>
              <Textarea name="question" required minLength={2} placeholder="Write your question (min 2 chars)..." className="w-full bg-white/5 border-none text-white text-3xl font-light p-5 focus-visible:ring-0 placeholder:text-white/10 resize-none min-h-37.5" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                <ImageIcon size={12} /> Supporting Imagery
              </div>
              {imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-white/2 border border-white/5 group transition-all">
                  <Image src={imageUrl} alt="preview" fill className="object-contain p-4" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                    <Button type="button" onClick={() => setImageUrl("")} className="bg-white text-black hover:bg-slate-200 rounded-sm px-4 text-[10px] font-bold uppercase tracking-widest h-9">
                      <Trash2 size={14} className="mr-2" /> Delete Media
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-white/2 border border-dashed border-white/5 hover:bg-white/4 transition-all text-center">
                  <UploadDropzone endpoint="imageUploader" onClientUploadComplete={(res) => setImageUrl(res?.[0]?.url || "")} className="border-none ut-label:text-slate-600 ut-button:bg-white ut-button:text-black ut-button:text-[10px] ut-button:font-bold ut-button:uppercase ut-button:px-4 ut-button:rounded-sm ut-allowed-content:text-slate-700" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 px-1">
                  <Check size={12} /> Correct Answer
                </label>
                <Input name="correct" required placeholder="Type the truth..." className="bg-white/5 border-none text-white h-12 rounded-lg px-4 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-slate-700" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 px-1">
                  <Hash size={12} /> Wrong Options
                </label>
                {['1', '2', '3'].map((i) => (
                  <Input key={i} name={`wrong${i}`} required placeholder={`Alternative #${i}`} className="bg-white/5 border-none text-white h-12 rounded-lg px-4 text-sm focus-visible:ring-1 focus-visible:ring-white/10 transition-all placeholder:text-slate-800" />
                ))}
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <Button type="submit" disabled={questions.length >= 20} className="w-full h-14 bg-white/10 text-white hover:bg-white/20 font-bold uppercase tracking-[0.2em] text-[10px] rounded-lg transition-all">
                {questions.length >= 20 ? "Limit Reached" : "Add Question to Queue"}
              </Button>
              
              <Button 
                type="button"
                onClick={handleFinalSubmit}
                disabled={bulkSubmitMutation.isPending || questions.length < 15}
                className="w-full h-14 bg-white text-black hover:bg-slate-200 font-bold uppercase tracking-[0.2em] text-[10px] rounded-lg transition-all"
              >
                {bulkSubmitMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  questions.length < 15 ? `Need ${15 - questions.length} more` : `Finalize & Upload (${questions.length})`
                )}
              </Button>
              
              <div className="flex gap-3 text-slate-700 mt-4">
                <Info size={14} className="shrink-0" />
                <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed italic">
                  Data is saved locally. Finalize once you have 15-20 questions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};