'use client';

import { Timer } from "lucide-react";

interface ExamHeaderProps {
  timeLeft: number;
  formatTimeStr: (totalSeconds: number) => string;
  isTimeCritical: boolean;
  subjectsList: string[];
  activeSubject: string;
  setActiveSubject: (subject: string) => void;
}

export function ExamHeader({
  timeLeft,
  formatTimeStr,
  isTimeCritical,
  subjectsList,
  activeSubject,
  setActiveSubject,
}: ExamHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
          isTimeCritical ? "bg-red-50 border-red-100 text-red-600 animate-pulse font-bold" : "bg-slate-50 border-slate-100 text-slate-600"
        }`}>
          <Timer className="w-4 h-4" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Time Remaining:</span>
          <span className="font-mono text-xs font-bold">{formatTimeStr(timeLeft)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
          {subjectsList.map((subject) => (
            <button
              type="button"
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                subject === activeSubject ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}