'use client';

import { Award, BookOpen, CheckCircle } from "lucide-react";

interface SubjectScore {
  correct: number;
  total: number;
}

interface ScoreBreakdown {
  subjectScores: Record<string, SubjectScore>;
  totalCorrect: number;
  totalQuestions: number;
}

interface ExamResultModalProps {
  scoreBreakdown: ScoreBreakdown | null;
}

export function ExamResultModal({ scoreBreakdown }: ExamResultModalProps) {
  if (!scoreBreakdown) return null;

  const totalPercentage = Math.round(
    (scoreBreakdown.totalCorrect / (scoreBreakdown.totalQuestions || 1)) * 100
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-6 text-center text-white shrink-0">
          <Award className="w-8 h-8 mx-auto mb-2 text-white/90 animate-bounce" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Examination Complete</h2>
          <p className="text-xs text-emerald-100 mt-1">Your answers have been securely synced.</p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          
          {/* Overall Score Banner */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-xl p-5 flex items-center justify-between border border-slate-200/50">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Overall Score
              </span>
              <p className="text-3xl font-black text-slate-800 tracking-tight">
                {totalPercentage}%
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {scoreBreakdown.totalCorrect} / {scoreBreakdown.totalQuestions} Correct
              </span>
            </div>
          </div>

          {/* Subject Breakdown Title */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Subject Performance
            </h3>
            
            {/* Subject Rows Wrapper */}
            <div className="space-y-3">
              {Object.entries(scoreBreakdown.subjectScores || {}).map(([subject, stats]) => {
                const subjectPercentage = Math.round((stats.correct / (stats.total || 1)) * 100);
                
                return (
                  <div 
                    key={subject} 
                    className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm space-y-2 hover:border-slate-200/80 transition-colors"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 capitalize">
                        {subject.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-slate-500 font-medium">
                        {stats.correct} / {stats.total} ({subjectPercentage}%)
                      </span>
                    </div>
                    
                    {/* Progress Bar Track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                        style={{ width: `${subjectPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button 
            type="button" 
            onClick={() => window.location.reload()} 
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}