'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Trophy, Award, Medal, CheckCircle2, BarChart3, ArrowLeft } from "lucide-react";
import { trpc } from "@/trpc/client"; 
import { ExamHeader } from "./components/ExamHeader";
import { ExamCanvas } from "./components/ExamCanvas";
import { ExamFooter } from "./components/ExamFooter";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  questionText: string;
  imageUrl?: string | null;
  options: string[];
  correctAnswer: string;
  subject: string;
}

interface LeaderboardParticipant {
  name: string;
  score: number;
  id?: string | number;
}

interface LiveExamPortalProps {
  quizEventId: number; 
  initialSecondsRemaining: number; 
  registeredSubjects?: string[];
  categorizedQuestions?: Record<string, Question[]>;
  participantName?: string;
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
  participantName = "You",
}: LiveExamPortalProps) {
  const safeQuizEventId = Number(quizEventId);
  const subjectsList = registeredSubjects.length > 0 ? registeredSubjects : Object.keys(categorizedQuestions);
  const [activeSubject, setActiveSubject] = useState<string>(subjectsList[0] || "");
  const [subjectIndices, setSubjectIndices] = useState<Record<string, number>>({});
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(initialSecondsRemaining);
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(initialSecondsRemaining <= 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(
    initialSecondsRemaining <= 0 ? { subjectScores: {}, totalCorrect: 0, totalQuestions: 0 } : null
  );
  const [showLeaderboardView, setShowLeaderboardView] = useState<boolean>(initialSecondsRemaining <= 0);
  
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    buttonText?: string;
  }>({ isOpen: false, title: "", message: "" });

  const wasSubmitted = useRef(initialSecondsRemaining <= 0);
  
  const submitScoreMutation = trpc.userquizathon.submitFinalScore.useMutation();

  const { data: serverLeaderboard, refetch: refetchLeaderboard } = trpc.userquizathon.getLeaderboard.useQuery(
    { quizEventId: safeQuizEventId },
    { enabled: isExamSubmitted || showLeaderboardView }
  );

  useEffect(() => {
    if (typeof window !== "undefined" && !isNaN(safeQuizEventId)) {
      const savedProgress = localStorage.getItem(`exam_progress_${safeQuizEventId}`);
      if (savedProgress && timeLeft > 0) {
        setSelectedAnswers(JSON.parse(savedProgress));
      }
      setIsHydrated(true);
    }
  }, [safeQuizEventId, timeLeft]);

  useEffect(() => {
    if (isHydrated && timeLeft > 0 && !isNaN(safeQuizEventId)) {
      localStorage.setItem(`exam_progress_${safeQuizEventId}`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, safeQuizEventId, isHydrated, timeLeft]);

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
    wasSubmitted.current = true;
    setIsSubmitting(true);

    const results = calculateFinalScores();
    setScoreBreakdown(results);

    try {
      await submitScoreMutation.mutateAsync({
        quizEventId: safeQuizEventId,
        totalScore: results.totalCorrect,
      });
      
      await refetchLeaderboard();
      setIsExamSubmitted(true);
      setIsSubmitting(false);
      
      localStorage.removeItem(`exam_progress_${safeQuizEventId}`);
    } catch (err: any) {
      console.error("Database submission failed", err);
      wasSubmitted.current = false; 
      setIsSubmitting(false);
      setIsExamSubmitted(true);
      await refetchLeaderboard();
    }
  }, [calculateFinalScores, safeQuizEventId, submitScoreMutation, refetchLeaderboard]);

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
    if (isExamSubmitted || timeLeft <= 0) return;

    const clockInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(clockInterval);
          executeSubmission();
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

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">Processing Final Submission</h2>
        <p className="text-slate-500 font-medium text-sm max-w-sm">
          Securing session lock and compiling final performance leaderboard...
        </p>
      </div>
    );
  }

  const sortedLeaderboard: LeaderboardParticipant[] = 
    serverLeaderboard && serverLeaderboard.length > 0 
      ? [...serverLeaderboard].sort((a, b) => b.score - a.score)
      : scoreBreakdown 
        ? [{ name: participantName, score: scoreBreakdown.totalCorrect }] 
        : [];

  if (isExamSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-700">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-2">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Exam Session Concluded</h1>
            {scoreBreakdown && (
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Your final score: <strong className="text-indigo-400">{scoreBreakdown.totalCorrect}</strong> / {scoreBreakdown.totalQuestions}
              </p>
            )}
          </div>

          {!showLeaderboardView ? (
            <div className="space-y-4 pt-4">
              <Button 
                onClick={() => setShowLeaderboardView(true)}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl h-14 transition-all shadow-md text-sm sm:text-base"
              >
                <BarChart3 className="w-5 h-5" />
                View Leaderboard Rankings
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/dashboard"}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 font-bold rounded-xl h-12"
              >
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLeaderboardView(false)}
                  className="text-xs text-slate-400 hover:text-white gap-1 pl-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Summary
                </Button>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Session Closed
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 divide-y divide-slate-800/50 overflow-hidden max-h-60 overflow-y-auto">
                {sortedLeaderboard.map((item, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;

                  return (
                    <div key={item.id ?? idx} className="flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          {isFirst ? <Trophy className="w-4 h-4 text-amber-400" /> :
                           isSecond ? <Medal className="w-4 h-4 text-slate-300" /> :
                           isThird ? <Award className="w-4 h-4 text-amber-600" /> :
                           <span className="text-xs font-bold text-slate-500">{idx + 1}</span>}
                        </div>
                        <span className="font-bold text-slate-200 text-sm truncate">{item.name}</span>
                      </div>
                      <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 font-black text-xs shrink-0">
                        {item.score} score
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={() => window.location.href = "/dashboard"}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl h-12 transition-all shadow-md text-sm"
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (subjectsList.length === 0 || !isHydrated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading exam portal...</p>
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