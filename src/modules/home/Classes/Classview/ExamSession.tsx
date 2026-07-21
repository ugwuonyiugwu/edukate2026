'use client';

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
import { trpc } from "@/trpc/client"; 
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";
import { toast } from "sonner";

interface DBQuestion {
  id: string;
  classId: string;
  type: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctAnswer: number;
  createdAt: Date | null;
  subject?: string | null;
}

interface Question {
  id: string;
  questionText: string;
  imageUrl?: string | null;
  options: string[];
  subject: string;
  type: string;
}

interface LiveExamPortalProps {
  onSubmitComplete?: (result: { score: number; total: number; isExam: boolean }) => void;
  classId: string;
  mode: "practice" | "exam";
  durationMinutes?: number; 
}

export const LiveExamPortal = ({
  onSubmitComplete,
  classId,
  mode,
  durationMinutes = 30, 
}: LiveExamPortalProps) => {
  const questionType = (mode === "exam" ? "CLASSWORK" : "TEST") as "CLASSWORK" | "TEST";

  const [rawQuestions] = trpc.classes.getQuestions.useSuspenseQuery({ 
    classId, 
    type: questionType 
  });
  
  const [examResult, setExamResult] = useState<{ score: number; total: number; isExam: boolean } | null>(null);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);

  const submitExamMutation = trpc.classes.submitExam.useMutation({
    onSuccess: (data) => {
      setExamResult(data);
      onSubmitComplete?.(data);
    },
    onError: (error) => {
      toast.error(`Submission failed: ${error.message}`);
    },
  });
  
  const questions: Question[] = useMemo(() => {
    if (!rawQuestions || !Array.isArray(rawQuestions)) return [];
    return (rawQuestions as DBQuestion[]).map((q) => ({
      id: q.id,
      questionText: q.text,
      imageUrl: q.imageUrl,
      options: q.options,
      subject: q.subject || "General",
      type: q.type,
    }));
  }, [rawQuestions]);
  
  const categorizedQuestions = useMemo(() => {
    return questions.reduce((acc, q) => {
      const subject = q.subject || "General";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(q);
      return acc;
    }, {} as Record<string, Question[]>);
  }, [questions]);

  const registeredSubjects = Object.keys(categorizedQuestions);
  
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [subjectIndices, setSubjectIndices] = useState<Record<string, number>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(durationMinutes * 60);

  useEffect(() => {
    if (registeredSubjects.length > 0 && (!activeSubject || !categorizedQuestions[activeSubject])) {
      setActiveSubject(registeredSubjects[0]);
    }
  }, [registeredSubjects, activeSubject, categorizedQuestions]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!submitExamMutation.isPending && !submitExamMutation.isSuccess && !examResult) {
        toast.error("Time is up! Submitting your assessment automatically.");
        submitExamMutation.mutate({
          classId,
          type: questionType,
          answers: selectedAnswers,
        });
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedAnswers, classId, questionType, submitExamMutation, examResult]);

  const currentQuestionsList = categorizedQuestions[activeSubject] || [];
  const currentIndex = subjectIndices[activeSubject] || 0;
  const currentQuestion = currentQuestionsList[currentIndex];
  
  const randomizedOptions = useMemo(() => {
    if (!currentQuestion || !currentQuestion.options) return [];
    const shuffled = [...currentQuestion.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [currentQuestion?.id]); 

  const optionPrefixes = ["A", "B", "C", "D"];

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < currentQuestionsList.length - 1) {
      setSubjectIndices((prev) => ({
        ...prev,
        [activeSubject]: currentIndex + 1,
      }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSubjectIndices((prev) => ({
        ...prev,
        [activeSubject]: currentIndex - 1,
      }));
    }
  };

  const handleConfirmSubmit = () => {
    submitExamMutation.mutate({
      classId,
      type: questionType,
      answers: selectedAnswers,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (registeredSubjects.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <p className="text-slate-500 font-medium">No exam questions available for this mode ({classId}).</p>
      </div>
    );
  }

  if (examResult) {
    const percentage = Math.round((examResult.score / (examResult.total || 1)) * 100);
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 antialiased">
        <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200/80 shadow-lg p-8 md:p-10 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-[#009b72] rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-xs">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>
          
          <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase block mb-1">
            {mode === "practice" ? "Practice Test Completed" : "Examination Submitted"}
          </span>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 font-serif">Assessment Results</h2>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 flex justify-around items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Final Score</span>
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{examResult.score} / {examResult.total}</span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Percentage</span>
              <span className={`text-3xl font-extrabold font-mono ${percentage >= 50 ? "text-blue-600" : "text-[#f47264]"}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between antialiased selection:bg-indigo-500/15 pb-16">
      
      <AppAlertDialog
        isOpen={isConfirmAlertOpen}
        onOpenChange={setIsConfirmAlertOpen}
        title="Submit Assessment"
        message="Are you sure you want to submit your exam answers? You will not be able to change them afterwards."
        buttonText={submitExamMutation.isPending ? "Submitting..." : "Confirm Submit"}
        onConfirm={handleConfirmSubmit}
      />

      <header className="w-full bg-white border-b border-slate-200/80 shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="max-w-300 w-full mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#009b72]">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
            <span className="font-extrabold text-sm uppercase tracking-wider">
              {mode === "practice" ? "Practice Mode (Test)" : "Examination (Class Work)"} 
              <span className="text-slate-400 font-normal ml-2">({classId})</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="grid grid-cols-2 md:flex items-center gap-2">
              {registeredSubjects.map((subject) => {
                const isActive = subject === activeSubject;
                const answeredCount = (categorizedQuestions[subject] || []).filter(
                  (q) => selectedAnswers[q.id] !== undefined
                ).length;
                const totalCount = (categorizedQuestions[subject] || []).length;

                return (
                  <button
                    type="button"
                    key={subject}
                    onClick={() => setActiveSubject(subject)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-all text-center flex justify-between items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#009b72] border-[#009b72] text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{subject}</span>
                    <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                      isActive ? "bg-[#007a59] text-emerald-100" : "bg-slate-200 text-slate-600"
                    }`}>
                      {answeredCount}/{totalCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-300 w-full mx-auto px-4 ">
        {currentQuestion ? (
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-8 min-h-112.5 flex flex-col justify-between">
            
            {/* In-line header with subject, question index, and prominent countdown timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
              <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase">
                {activeSubject} — Question {currentIndex + 1}
              </span>
              <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-600 px-4 py-2 rounded-lg font-mono text-sm font-extrabold shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl text-slate-800 font-normal font-serif tracking-wide leading-relaxed">
                {currentQuestion.questionText}
              </h2>
              {currentQuestion.imageUrl && (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question diagram" 
                  className="mt-6 max-h-48 object-contain rounded-md border border-slate-100"
                />
              )}
            </div>

            <div className="space-y-4 max-w-md">
              {randomizedOptions.map((option, idx) => {
                const prefix = optionPrefixes[idx];
                const isSelected = selectedAnswers[currentQuestion.id] === option;

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="group flex items-center gap-4 w-full text-left py-1.5 focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-slate-400 w-6">
                      ({prefix})
                    </span>
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? "border-[#009b72] bg-white shadow-[inset_0_0_0_2px_#fff,inset_0_0_0_6px_#009b72]" 
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`} />
                    <span className="text-base text-slate-800 font-medium pl-1">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-400">No questions found under the {activeSubject} category track.</p>
          </div>
        )}
      </main>

      <footer className="w-full bg-white border-t border-slate-200/80 py-4 mt-8 z-20">
        <div className="max-w-300 w-full mx-auto px-4 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="order-2 sm:order-1 flex justify-start">
            <button
              type="button"
              onClick={() => setIsConfirmAlertOpen(true)}
              disabled={submitExamMutation.isPending}
              className="bg-blue-600 hover:bg-[#008561] text-white font-extrabold text-xs uppercase tracking-wider px-6 h-10 rounded-md shadow-xs transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            >
              {submitExamMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
          
          <div className="order-1 sm:order-2 flex justify-center items-center gap-2 flex-wrap">
            {currentQuestionsList.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = selectedAnswers[q.id] !== undefined;

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => setSubjectIndices(prev => ({ ...prev, [activeSubject]: idx }))}
                  className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#ec930c] border-[#f47264] text-white shadow-xs"
                      : isAnswered
                      ? "bg-blue-600 border-slate-300 text-slate-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="order-3 flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0 || currentQuestionsList.length === 0}
              className="flex items-center justify-center gap-1 border border-slate-200 bg-[#ccece3] text-[#009b72] font-extrabold text-xs uppercase tracking-wider px-4 h-10 rounded-md transition-all hover:bg-[#bce4d9] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-3" />
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === currentQuestionsList.length - 1 || currentQuestionsList.length === 0}
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-[#008561] text-white font-extrabold text-xs uppercase tracking-wider px-4 h-10 rounded-md transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4 stroke-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};