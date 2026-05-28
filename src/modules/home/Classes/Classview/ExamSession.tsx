'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface Question {
  id: number;
  questionText: string;
  imageUrl?: string | null;
  options: string[];
  subject: string;
}

// Updated interface to include classId and mode
interface LiveExamPortalProps {
  categorizedQuestions?: Record<string, Question[]>;
  onSubmitExam?: (answers: Record<number, string>) => void;
  isSubmitting?: boolean;
  classId: string;
  mode: "practice" | "exam";
}

export const LiveExamPortal = ({
  categorizedQuestions = {},
  onSubmitExam,
  isSubmitting = false,
  classId, // Now destructured
  mode,    // Now destructured
}: LiveExamPortalProps) => {
  const registeredSubjects = Object.keys(categorizedQuestions);
  
  // States to monitor active subject tab and corresponding indices
  const [activeSubject, setActiveSubject] = useState<string>(registeredSubjects[0] || "");
  const [subjectIndices, setSubjectIndices] = useState<Record<string, number>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  // ... rest of your existing logic remains exactly the same ...
  
  if (registeredSubjects.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <p className="text-slate-500 font-medium">No exam questions available.</p>
      </div>
    );
  }

  const currentQuestionsList = categorizedQuestions[activeSubject] || [];
  const currentIndex = subjectIndices[activeSubject] || 0;
  const currentQuestion = currentQuestionsList[currentIndex];
  
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

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit your exam answers?")) {
      onSubmitExam?.(selectedAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between antialiased selection:bg-indigo-500/10">
      
      {/* --- Subject Category Navigation Dock --- */}
      <header className="w-full bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1200px] w-full mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#009b72]">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
            <span className="font-extrabold text-sm uppercase tracking-wider">
              {mode === "practice" ? "Practice Mode" : "Examination"} 
              <span className="text-slate-400 font-normal ml-2">({classId})</span>
            </span>
          </div>
          
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
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider border transition-all text-center flex justify-between items-center gap-3 ${
                    isActive
                      ? "bg-[#009b72] border-[#009b72] text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{subject}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? "bg-[#007a59] text-emerald-100" : "bg-slate-200 text-slate-600"
                  }`}>
                    {answeredCount}/{totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* --- Main Question Presentation Canvas --- */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 pt-6">
        {currentQuestion ? (
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 md:p-12 min-h-[450px] flex flex-col justify-between">
            
            <div className="mb-10">
              <span className="text-xs font-extrabold tracking-widest text-[#009b72] uppercase block mb-2">
                {activeSubject} — Question {currentIndex + 1}
              </span>
              <h2 className="text-2xl text-slate-800 font-normal font-serif tracking-wide leading-relaxed">
                {currentQuestion.questionText}
              </h2>
              {currentQuestion.imageUrl && (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question diagram asset" 
                  className="mt-6 max-h-48 object-contain rounded-md border border-slate-100"
                />
              )}
            </div>

            <div className="space-y-4 max-w-md">
              {currentQuestion.options.map((option, idx) => {
                const prefix = optionPrefixes[idx];
                const isSelected = selectedAnswers[currentQuestion.id] === option;

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="group flex items-center gap-4 w-full text-left py-1.5 focus:outline-none"
                  >
                    <span className="text-sm font-semibold text-slate-400 w-6">
                      ({prefix})
                    </span>
                    <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 transition-all ${
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

      {/* --- Footer remains same --- */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 mt-8 sticky bottom-0 z-20">
        <div className="max-w-[1200px] w-full mx-auto px-4 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="order-2 sm:order-1 flex justify-start">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#009b72] hover:bg-[#008561] text-white font-extrabold text-xs uppercase tracking-wider px-6 h-10 rounded-md shadow-sm transition-colors duration-150 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Examination"}
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
                  className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center border transition-all ${
                    isCurrent
                      ? "bg-[#f47264] border-[#f47264] text-white shadow-sm"
                      : isAnswered
                      ? "bg-slate-100 border-slate-300 text-slate-700"
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
              className="flex items-center justify-center gap-1 border border-slate-200 bg-[#ccece3] text-[#009b72] font-extrabold text-xs uppercase tracking-wider px-4 h-10 rounded-md transition-all hover:bg-[#bce4d9] disabled:opacity-40 disabled:hover:bg-[#ccece3] disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === currentQuestionsList.length - 1 || currentQuestionsList.length === 0}
              className="flex items-center justify-center gap-1 bg-[#009b72] hover:bg-[#008561] text-white font-extrabold text-xs uppercase tracking-wider px-4 h-10 rounded-md transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-[#009b72] disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};