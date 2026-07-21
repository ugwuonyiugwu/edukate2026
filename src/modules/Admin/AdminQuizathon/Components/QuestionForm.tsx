'use client';

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, Sparkles, X, Trash2, CheckCircle2 } from "lucide-react";
import { useUploadThing } from "@/app/utils/uploadthing"; 
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StagedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  pendingFile: File | null;
  previewUrl: string | null;
  imageUrl: string | null;
}

export function QuestionForm({ quizId, subject }: { quizId: number, subject: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("");
  
  // Local queue to hold questions before bulk submission
  const [stagedQueue, setStagedQueue] = useState<StagedQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  const utils = trpc.useUtils();
  
  // Assumes you have or will add a bulk mutation endpoint (e.g., addManyQuestions)
  // If your router uses a single name, replace .addManyQuestions with your batch procedure name.
  const bulkMutation = trpc.adminquizathon.addQuestion.useMutation({
    onSuccess: () => {
      utils.adminquizathon.getQuestionsBySubject.invalidate({ quizId, subject });
    }
  });

  const { startUpload } = useUploadThing("quizathonImage", {
    onUploadError: (error: Error) => {
      toast.error(`Asset upload failed: ${error.message}`);
      setIsUploading(false);
    }
  });

  const handleReset = () => {
    setText(""); 
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOptions(["", "", "", ""]); 
    setCorrect("");
    setStagedQueue([]);
    setIsUploading(false);
    setIsSubmittingAll(false);
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.warning("File size exceeds 4MB maximum limitation.");
        return;
      }
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStageQuestion = () => {
    if (!text || !correct || options.some(o => !o.trim())) {
      toast.warning("Incomplete Item", { description: "Please fill out the prompt, correct answer, and all 4 options." });
      return;
    }

    const newItem: StagedQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      questionText: text,
      options: [...options],
      correctAnswer: correct,
      pendingFile,
      previewUrl,
      imageUrl: null
    };

    setStagedQueue((prev) => [...prev, newItem]);
    
    // Clear current input fields for the next question
    setText("");
    setPendingFile(null);
    setPreviewUrl(null);
    setOptions(["", "", "", ""]);
    setCorrect("");
    toast.success("Question queued locally");
  };

  const handleRemoveStaged = (id: string) => {
    setStagedQueue((prev) => prev.filter(q => q.id !== id));
  };

  const handleBulkSubmit = async () => {
    if (stagedQueue.length === 0) return;

    try {
      setIsSubmittingAll(true);
      toast.loading("Uploading assets and saving batch...", { id: "bulk-upload-toast" });

      for (const item of stagedQueue) {
        let finalImageUrl = item.imageUrl;

        if (item.pendingFile) {
          setIsUploading(true);
          const uploadResponse = await startUpload([item.pendingFile]);
          if (uploadResponse && uploadResponse[0]) {
            finalImageUrl = uploadResponse[0].url;
          } else {
            throw new Error("Failed to process resource storage URL.");
          }
          setIsUploading(false);
        }

        // Submitting individual records sequentially or adapting to a batch endpoint
        await bulkMutation.mutateAsync({
          quizEventId: quizId,
          subject,
          questionText: item.questionText,
          imageUrl: finalImageUrl,
          options: item.options,
          correctAnswer: item.correctAnswer
        });
      }

      toast.success("Batch Submitted Successfully!", {
        id: "bulk-upload-toast",
        description: `Successfully added ${stagedQueue.length} items to ${subject} pool.`
      });
      handleReset();
    } catch (err: any) {
      console.error(err);
      toast.error("Batch Submission Failed", { id: "bulk-upload-toast", description: err.message });
      setIsSubmittingAll(false);
      setIsUploading(false);
    }
  };

  const isPendingState = isUploading || isSubmittingAll;

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) handleReset(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm px-6 py-6 shadow-lg shadow-indigo-100 transition-all active:scale-95 w-full sm:w-auto">
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest">Add {subject} Questions</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-2xl bg-slate-900 border-slate-800 p-0 rounded-sm overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="truncate">Bulk Manager: {subject}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Illustration Asset (Optional)</label>
              {previewUrl ? (
                <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  <img src={previewUrl} alt="Local asset preview match" className="h-full object-contain" />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-3 right-3 rounded-xl w-8 h-8"
                    onClick={() => {
                      setPendingFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950/40 focus-within:ring-2 focus-within:ring-indigo-500 transition-all cursor-pointer hover:border-indigo-500 group">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 tracking-wide transition-colors">
                    Click to select local image asset...
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Image (Max 4MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isPendingState} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your question content prompt here..."
                className="bg-slate-800 border-none text-white rounded-xl h-24 placeholder:text-slate-500 resize-none p-4 focus-visible:ring-indigo-500 text-xs sm:text-sm" 
                disabled={isPendingState}
              />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, i) => {
                  const isChoiceOne = i === 0;
                  return (
                    <div key={i} className="relative">
                      <Input 
                        value={opt} 
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                          if (isChoiceOne) setCorrect(e.target.value);
                        }}
                        placeholder={isChoiceOne ? "Choice 1 (Correct Answer)" : `Choice ${i + 1}`}
                        className={cn(
                          "bg-slate-800 border-none h-12 text-white rounded-xl focus-visible:ring-indigo-500 placeholder:text-slate-600 pr-10 text-xs sm:text-sm",
                          isChoiceOne && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 focus-visible:ring-emerald-500 placeholder:text-emerald-700/40 font-bold"
                        )}
                        disabled={isPendingState}
                      />
                      {isChoiceOne && opt && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-400 text-[10px] font-black tracking-widest bg-emerald-500/20 px-1.5 py-0.5 rounded-md uppercase">
                          Correct
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              type="button"
              onClick={handleStageQuestion}
              disabled={isPendingState || !text || !correct}
              className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-xl h-12 text-xs sm:text-sm transition-all border border-slate-700/50"
            >
              + Queue Question to Batch ({stagedQueue.length} Ready)
            </Button>

            {stagedQueue.length > 0 && (
              <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Staged Queue Preview</span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {stagedQueue.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg text-xs">
                      <span className="text-slate-200 truncate pr-2 font-medium">{idx + 1}. {item.questionText}</span>
                      <button onClick={() => handleRemoveStaged(item.id)} className="text-slate-400 hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit All Action Button */}
            <Button 
              onClick={handleBulkSubmit} 
              disabled={isPendingState || stagedQueue.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black rounded-2xl h-14 mt-4 transition-all shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {isPendingState ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>{isUploading ? "Uploading Asset..." : "Committing Batch..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save All Queued ({stagedQueue.length}) Items</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}