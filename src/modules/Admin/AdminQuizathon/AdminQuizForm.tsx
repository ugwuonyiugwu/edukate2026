'use client';

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Settings2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminQuizForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [currentQuiz] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();
  
  const [title, setTitle] = useState("");
  const [subjects, setSubjects] = useState("");
  const [date, setDate] = useState("");
  const [pointCost, setPointCost] = useState("0");
  const utils = trpc.useUtils();

  useEffect(() => {
    if (currentQuiz) {
      setTitle(currentQuiz.title);
      setSubjects(currentQuiz.subjects?.join(", ") ?? "");
      setPointCost(currentQuiz.pointCost?.toString() ?? "0");
      if (currentQuiz.registrationDeadline) {
        setDate(new Date(currentQuiz.registrationDeadline).toISOString().slice(0, 16));
      }
    }
  }, [currentQuiz]);

  const mutation = trpc.adminquizathon.updateEvent.useMutation({
    onMutate: () => {
      toast.loading("Saving configuration changes...", { id: "quiz-update-toast" });
    },
    onSuccess: () => {
      toast.success("Configuration Updated!", {
        id: "quiz-update-toast",
        description: `Successfully synchronized updates for "${title}".`,
      });

      utils.userquizathon.getLatestEvent.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error("Update Rejected", {
        id: "quiz-update-toast",
        description: err.message || "Could not synchronize configuration updates with the server.",
      });
    }
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-sm border border-indigo-100 mb-2">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-tight">
          Current Monthly Cycle Configuration
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quiz Title</label>
          <Input 
            placeholder="e.g., June 2026 Monthly Challenge" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="rounded-xl border-slate-200" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Point Cost</label>
            <Input 
              type="number" 
              value={pointCost} 
              onChange={(e) => setPointCost(e.target.value)} 
              className="rounded-xl border-slate-200" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Deadline</label>
            <Input 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="rounded-xl border-slate-200" 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monthly Subjects</label>
          <Input 
            placeholder="Math, Science, English..." 
            value={subjects} 
            onChange={(e) => setSubjects(e.target.value)} 
            className="rounded-xl border-slate-200" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Set Questions for the current month */}
        <Button 
          type="button"
          variant="outline"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 h-11 rounded-sm font-bold"
          onClick={() => router.push(`/admin/quizathon/${currentQuiz?.id}/question`)}
          disabled={!currentQuiz?.id}
        >
          <Settings2 className="mr-1 h-4 w-6" /> Questions
        </Button>

        <Button 
          type="button"
          onClick={() => mutation.mutate({
            id: currentQuiz?.id,
            title,
            registrationDeadline: new Date(date),
            subjects: subjects.split(",").map(s => s.trim()).filter(Boolean),
            pointCost: parseInt(pointCost) || 0
          })} 
          className="bg-indigo-600 hover:bg-indigo-700 h-11 rounded-sm font-bold shadow-lg shadow-indigo-100" 
          disabled={mutation.isPending || !currentQuiz?.id}
        >
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Event"}
        </Button>
      </div>
    </div>
  );
}