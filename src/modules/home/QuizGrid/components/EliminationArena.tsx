'use client';

import React, { useEffect } from 'react';
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Trophy, Loader2, Sparkles, Flame, ShieldAlert, Users } from 'lucide-react';

export const EliminationArena = ({ 
  quizId, 
  userFinalScore, 
  children 
}: { 
  quizId: string, 
  userFinalScore: number, 
  children: React.ReactNode 
}) => {
  const { user } = useUser();
  const { data: participants, isLoading } = trpc.quiz.getLiveParticipants.useQuery({ quizId }, {
    refetchInterval: 2000 
  });
  
  const eliminateMutation = trpc.quiz.eliminateLowest.useMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      // Only eliminate if there are distinct scores and more than 1 participant
      if (participants && participants.length > 1 && !eliminateMutation.isPending) {
        const scores = participants.map(p => p.score);
        const allTied = scores.every(s => s === scores[0]);
        // Skip elimination pulse if everyone left has an identical score (a tie)
        if (!allTied) {
          eliminateMutation.mutate({ quizId });
        }
      }
    }, 6000); 
    return () => clearInterval(interval);
  }, [participants, quizId, eliminateMutation]);

  const wasEliminated = participants && !participants.find(p => p.clerkId === user?.id);
  
  // Check for ties among remaining participants
  const topScore = participants && participants.length > 0 ? Math.max(...participants.map(p => p.score)) : 0;
  const tiedWinners = participants?.filter(p => p.score === topScore) || [];
  const isCoWinner = tiedWinners.some(p => p.clerkId === user?.id) && (participants?.length === 1 || tiedWinners.length === participants?.length);
  const isSingleWinner = participants?.length === 1 && participants[0].clerkId === user?.id;

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div className={`transition-all duration-1000 ${wasEliminated ? 'blur-2xl grayscale pointer-events-none' : 'opacity-100'}`}>
        {children}
      </div>

      {/* Floating Leaderboard Sidebar */}
      <div className="fixed top-24 right-6 w-80 z-50 pointer-events-none hidden lg:block">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-rose-500/25 rounded-2xl p-4 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-4 px-1 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <Flame size={14} className="animate-pulse" /> Arena Standings
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {participants?.length} Active
            </span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {participants?.map((p, i) => {
                const isMe = p.clerkId === user?.id;
                return (
                  <motion.div 
                    layout key={p.clerkId} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all 
                      ${isMe ? 'border-indigo-500 bg-indigo-500/25 shadow-lg shadow-indigo-500/10' : 'border-white/5 bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/30">#{i+1}</span>
                      <span className={`text-xs font-bold truncate w-32 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                        {p.user?.firstName || "Contender"}
                      </span>
                    </div>
                    <span className="text-xs font-black text-indigo-400 font-mono">{p.score} pts</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {wasEliminated && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl mb-6">
              <ShieldAlert className="w-20 h-20 text-rose-500 animate-bounce" />
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-2">Eliminated</h2>
            <p className="text-rose-400/80 font-mono text-xs md:text-sm tracking-[0.2em] uppercase">You have been purged from the arena</p>
            <div className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-indigo-400 font-bold font-mono tracking-widest text-sm">
              FINAL SCORE RECORDED: {userFinalScore}
            </div>
          </motion.div>
        )}

        {/* Celebratory Winner / Co-Winner Screen */}
        {(isSingleWinner || isCoWinner) && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 z-60 bg-linear-to-br from-indigo-950/90 via-slate-950/95 to-purple-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)] pointer-events-none" />
            
            <motion.div 
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4 }}
              className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.3)] mb-6 relative"
            >
              <Sparkles className="absolute -top-2 -right-2 text-amber-400 w-8 h-8 animate-spin" />
              {tiedWinners.length > 1 ? (
                <Users className="w-28 h-28 md:w-36 md:h-36 text-amber-400" />
              ) : (
                <Trophy className="w-28 h-28 md:w-36 md:h-36 text-amber-400" />
              )}
            </motion.div>

            <span className="text-xs font-black tracking-[0.4em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-3">
              {tiedWinners.length > 1 ? `Co-Champions (${tiedWinners.length} Way Tie)` : 'Sole Survivor'}
            </span>
            <h2 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase italic tracking-tighter drop-shadow-lg">
              {tiedWinners.length > 1 ? 'Victory Tied' : 'Champion'}
            </h2>
            <p className="text-slate-400 font-mono text-sm tracking-[0.3em] uppercase mt-4">
              {tiedWinners.length > 1 ? `Shared High Score • ${topScore} pts` : `Victory Secured • Final Score: ${userFinalScore}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};