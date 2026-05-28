'use client';

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, Sparkles, X } from "lucide-react";
import { useUploadThing } from "@/app/utils/uploadthing"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuestionForm({ quizId, subject }: { quizId: number, subject: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("");
  
  const utils = trpc.useUtils();
  
  // 🛡️ Updated to look inside the adminquizathon sub-router namespace
  const mutation = trpc.adminquizathon.addQuestion.useMutation({
    onSuccess: () => {
      utils.adminquizathon.getQuestionsBySubject.invalidate({ quizId, subject });
      handleReset();
    }
  });

  const { startUpload } = useUploadThing("quizathonImage", {
    onUploadError: (error: Error) => {
      alert(`Asset upload failed: ${error.message}`);
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
    setIsUploading(false);
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds 4MB maximum limitation.");
        return;
      }
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      let finalImageUrl = null;

      if (pendingFile) {
        const uploadResponse = await startUpload([pendingFile]);
        if (uploadResponse && uploadResponse[0]) {
          finalImageUrl = uploadResponse[0].url;
        } else {
          throw new Error("Failed to get target resource storage URL.");
        }
      }

      mutation.mutate({ 
        quizEventId: quizId, 
        subject, 
        questionText: text, 
        imageUrl: finalImageUrl, 
        options, 
        correctAnswer: correct
      });
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const isPendingState = mutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) handleReset(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all active:scale-95">
          <PlusCircle className="w-5 h-5" />
          <span className="font-black uppercase text-[11px] tracking-widest">Add New {subject} Question</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] bg-slate-900 border-slate-800 p-0 rounded-sm overflow-hidden max-h-[100vh]">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              New {subject} Item
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Illustration Asset (Optional)</label>
              {previewUrl ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
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
                className="bg-slate-800 border-none text-white rounded-xl h-24 placeholder:text-slate-500 resize-none p-4 focus-visible:ring-indigo-500" 
                disabled={isPendingState}
              />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
                          
                          if (isChoiceOne) {
                            setCorrect(e.target.value);
                          }
                        }}
                        placeholder={isChoiceOne ? "Choice 1 (Correct Answer)" : `Choice ${i + 1}`}
                        className={cn(
                          "bg-slate-800 border-none h-12 text-white rounded-xl focus-visible:ring-indigo-500 placeholder:text-slate-600 pr-10",
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

            {/* Submit Action Button */}
            <Button 
              onClick={handleSave} 
              disabled={isPendingState || !text || !correct}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black rounded-2xl h-14 mt-2 transition-all shadow-md"
            >
              {isPendingState ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>{isUploading ? "Uploading Asset..." : "Saving Item..."}</span>
                </div>
              ) : (
                "Confirm & Save Item"
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