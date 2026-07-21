'use client';

interface Question {
  id: number;
}

interface ExamFooterProps {
  currentQuestions: Question[];
  currentIndex: number;
  activeSubject: string;
  selectedAnswers: Record<number, string>;
  setSubjectIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleManualSubmit: () => void;
}

export function ExamFooter({
  currentQuestions,
  currentIndex,
  activeSubject,
  selectedAnswers,
  setSubjectIndices,
  handleManualSubmit,
}: ExamFooterProps) {
  return (
    <>
      {/* TRACKER MAP */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-16 py-4 border-t border-slate-50">
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto py-1 pl-2 sm:pl-8 lg:pl-12">
          {currentQuestions.map((q, idx) => (
            <button
              type="button"
              key={q.id}
              onClick={() => setSubjectIndices((prev) => ({ ...prev, [activeSubject]: idx }))}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                idx === currentIndex
                  ? "border-slate-400 bg-white text-slate-800 ring-2 ring-slate-100"
                  : selectedAnswers[q.id]
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </section>

      {/* FOOTER ACTIONS CONTROLS */}
      <footer className="w-full bg-white border-t border-slate-100 py-3.5 sticky bottom-0 z-20">
        <div className="max-w-4xl w-full mx-auto px-6 sm:px-8 md:px-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubjectIndices((prev) => ({ ...prev, [activeSubject]: Math.max(0, currentIndex - 1) }))}
            disabled={currentIndex === 0}
            className="text-slate-400 hover:text-slate-700 font-bold text-xs uppercase tracking-wider py-2 disabled:opacity-20"
          >
            Prev
          </button>

          <button
            type="button"
            onClick={handleManualSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm"
          >
            Submit Script
          </button>

          <button
            type="button"
            onClick={() => setSubjectIndices((prev) => ({ ...prev, [activeSubject]: Math.min(currentQuestions.length - 1, currentIndex + 1) }))}
            disabled={currentIndex === currentQuestions.length - 1 || currentQuestions.length === 0}
            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider py-2 disabled:opacity-20"
          >
            Next
          </button>
        </div>
      </footer>
    </>
  );
}