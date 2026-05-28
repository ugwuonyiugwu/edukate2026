'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client"; 
import { ExamHeader } from "./components/ExamHeader";
import { ExamCanvas } from "./components/ExamCanvas";
import { ExamFooter } from "./components/ExamFooter";
import { ExamResultModal } from "./components/ExamResultModal";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";

interface Question {
  id: number;
  questionText: string;
  imageUrl?: string | null;
  options: string[];
  correctAnswer: string;
  subject: string;
}

interface LiveExamPortalProps {
  quizEventId: number; 
  initialSecondsRemaining: number; 
  registeredSubjects?: string[];
  categorizedQuestions?: Record<string, Question[]>;
}

interface ScoreBreakdown {
  subjectScores: Record<string, { correct: number; total: number }>;
  totalCorrect: number;
  totalQuestions: number;
}

export function LiveExamPortal({
  quizEventId,
  initialSecondsRemaining,
  registeredSubjects = [],
  categorizedQuestions = {},
}: LiveExamPortalProps) {
  const subjectsList = registeredSubjects.length > 0 ? registeredSubjects : Object.keys(categorizedQuestions);
  const [activeSubject, setActiveSubject] = useState<string>(subjectsList[0] || "");
  const [subjectIndices, setSubjectIndices] = useState<Record<string, number>>({});
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // 🛡️ Safe Server-Matching Baseline Initializers to eliminate SSR layout mismatches
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(initialSecondsRemaining);
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  
  // 🚨 State manager for the modular modal component
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    buttonText?: string;
  }>({ isOpen: false, title: "", message: "" });

  const wasSubmitted = useRef(false);
  
  // 🛠️ MATCHES THE UPDATED BACKEND ROUTER PATH
  const submitScoreMutation = trpc.userquizathon.submitFinalScore.useMutation();

  // 📦 Client-Side Hydration: Sync with localStorage safely after mounting
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem(`exam_progress_${quizEventId}`);
      if (savedProgress) {
        setSelectedAnswers(JSON.parse(savedProgress));
      }
      setIsHydrated(true);
    }
  }, [quizEventId]);

  // 📝 Synchronize progress to localStorage only AFTER the state has cleanly hydrated
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(`exam_progress_${quizEventId}`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, quizEventId, isHydrated]);

  useEffect(() => {
    if (subjectsList.length > 0 && !activeSubject) {
      setActiveSubject(subjectsList[0]);
    }
  }, [subjectsList, activeSubject]);

  const currentQuestions = categorizedQuestions[activeSubject] || [];
  const currentIndex = subjectIndices[activeSubject] || 0;
  const currentQuestion = currentQuestions[currentIndex];

  useEffect(() => {
    if (currentQuestion?.options) {
      const optionsCopy = [...currentQuestion.options];
      for (let i = optionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
      }
      setShuffledOptions(optionsCopy);
    } else {
      setShuffledOptions([]);
    }
  }, [currentQuestion?.id]);

  const calculateFinalScores = useCallback(() => {
    const breakdown: Record<string, { correct: number; total: number }> = {};
    let grandCorrect = 0;
    let grandTotal = 0;

    subjectsList.forEach((subj) => {
      const trackQuestions = categorizedQuestions[subj] || [];
      let correctCounter = 0;
      trackQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) correctCounter++;
      });
      breakdown[subj] = { correct: correctCounter, total: trackQuestions.length };
      grandCorrect += correctCounter;
      grandTotal += trackQuestions.length;
    });

    return { subjectScores: breakdown, totalCorrect: grandCorrect, totalQuestions: grandTotal };
  }, [categorizedQuestions, selectedAnswers, subjectsList]);

  const executeSubmission = useCallback(async () => {
    if (wasSubmitted.current) return;
    wasSubmitted.current = true; // 🔒 Locked instantly to avoid duplicate submissions
    setIsSubmitting(true);

    const results = calculateFinalScores();
    setScoreBreakdown(results);

    try {
      await submitScoreMutation.mutateAsync({
        quizEventId: Number(quizEventId),
        totalScore: results.totalCorrect,
      });
      
      setIsExamSubmitted(true);
      setIsSubmitting(false);
      
      // 🧼 Clean up local storage cache only upon a verified, successful database save
      localStorage.removeItem(`exam_progress_${quizEventId}`);
    } catch (err: any) {
      console.error("Database submission failed", err);
      
      // 🔓 Re-open state locks immediately on catching network or server drops
      wasSubmitted.current = false; 
      setIsSubmitting(false);

      // 🔄 Inject context-specific messaging directly down to the dialog state
      const alertMessage = err?.message?.includes("No open examination record")
        ? "The server could not verify an open registration profile for this exam month. If you believe this is an error, please verify your network connection and retry."
        : "Failed to securely stream test metrics to your user profile. Please verify your connection status and try again.";

      setAlert({
        isOpen: true,
        title: "Submission Sync Failure",
        message: alertMessage,
        buttonText: "Retry Submission",
        onConfirm: () => {
          executeSubmission();
        }
      });
    }
  }, [calculateFinalScores, quizEventId, submitScoreMutation]);

  const handleManualSubmit = () => {
    setAlert({
      isOpen: true,
      title: "Finalize Submission?",
      message: "Are you sure you want to finalize your exam script? This action cannot be undone.",
      buttonText: "Submit Exam",
      onConfirm: () => {
        executeSubmission();
      }
    });
  };

  useEffect(() => {
    if (isExamSubmitted) return;

    const handleTimeoutSubmission = async () => {
      await executeSubmission();
      window.location.reload();
    };

    if (timeLeft <= 0) {
      handleTimeoutSubmission();
      return;
    }

    const clockInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(clockInterval);
          handleTimeoutSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isExamSubmitted, timeLeft, executeSubmission]);

  const formatTimeStr = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || timeLeft <= 0) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  };

  // ⏳ Keep layout alive during normal testing and only lock layout during active loading state masks
  if ((timeLeft <= 0 || isSubmitting) && !alert.isOpen && !isExamSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-800">Processing Submission</h2>
        <p className="text-slate-500 font-medium text-sm max-w-sm">
          Securing session lock and transmitting answers. This portal is now closing...
        </p>
      </div>
    );
  }

  if (subjectsList.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Loading exam configuration...</p>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Hydrating Session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col justify-between font-sans antialiased text-slate-800 overflow-hidden">
      <ExamHeader
        timeLeft={timeLeft}
        formatTimeStr={formatTimeStr}
        isTimeCritical={timeLeft <= 600}
        subjectsList={subjectsList}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
      />

      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/20">
        <ExamCanvas
          activeSubject={activeSubject}
          currentIndex={currentIndex}
          currentQuestions={currentQuestions}
          currentQuestion={currentQuestion}
          shuffledOptions={shuffledOptions}
          selectedAnswers={selectedAnswers}
          handleSelectOption={handleSelectOption}
        />
      </div>

      <ExamFooter
        currentQuestions={currentQuestions}
        currentIndex={currentIndex}
        activeSubject={activeSubject}
        selectedAnswers={selectedAnswers}
        setSubjectIndices={setSubjectIndices}
        handleManualSubmit={handleManualSubmit}
      />

      {isExamSubmitted && scoreBreakdown && (
        <ExamResultModal scoreBreakdown={scoreBreakdown} />
      )}

      {/* 🔮 DECOUPLED ALERT DIALOG INTERFACE */}
      <AppAlertDialog 
        isOpen={alert.isOpen}
        onOpenChange={(open) => setAlert(prev => ({ ...prev, isOpen: open }))}
        title={alert.title}
        message={alert.message}
        buttonText={alert.buttonText}
        onConfirm={alert.onConfirm ? () => {
          alert.onConfirm?.();
          setAlert(prev => ({ ...prev, isOpen: false }));
        } : undefined}
      />
    </div>
  );
}