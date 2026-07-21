'use client';

import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MathText } from "./MathText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function QuestionTable({ quizId, subject }: { quizId: number, subject: string }) {
  const utils = trpc.useUtils();
  
  const [questions] = trpc.adminquizathon.getQuestionsBySubject.useSuspenseQuery({ quizId, subject });
  
  const deleteMutation = trpc.adminquizathon.deleteQuestion.useMutation({
    onSuccess: () => utils.adminquizathon.getQuestionsBySubject.invalidate({ quizId, subject })
  });

  return (
    <div className="md:border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center font-black text-slate-400 text-[10px]">NO.</TableHead>
            <TableHead className="font-bold text-slate-600">QUESTION STATEMENT</TableHead>
            <TableHead className="font-bold text-blue-600">CORRECT</TableHead>
            <TableHead className="font-bold text-slate-400">DISTRACTORS</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q, i) => (
            <TableRow key={q.id} className="group hover:bg-slate-50/30 transition-colors">
              <TableCell className="text-center font-black text-slate-300 text-xs">{i + 1}</TableCell>
              <TableCell className="font-bold text-slate-700 max-w-sm leading-relaxed py-4">
                <div className="flex flex-col gap-3">
                  <MathText text={q.questionText} className="text-sm" />
                  {q.imageUrl && (
                    <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group/img transition-all hover:w-64 hover:h-40">
                      <img 
                        src={q.imageUrl} 
                        alt="Question asset item" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Correct Answer Box with MathText Support */}
              <TableCell>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[11px] font-black border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 
                  <MathText text={q.correctAnswer} />
                </div>
              </TableCell>

              {/* Distractor Badges with MathText Support */}
              <TableCell>
                <div className="flex flex-wrap gap-2 max-w-xs">
                  {q.options.filter(opt => opt !== q.correctAnswer).map((wrong, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                      <XCircle className="w-3 h-3 text-slate-300 shrink-0" /> 
                      <MathText text={wrong} />
                    </div>
                  ))}
                </div>
              </TableCell>

              {/* Seamless UploadThing-Style Modal Deletion Trigger */}
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  
                  <AlertDialogContent className="max-w-100 rounded-sm bg-white p-4 shadow-2xl border-none">
                    <AlertDialogHeader className="space-y-1">
                      <AlertDialogTitle className="text-xl font-bold text-slate-900">
                        Delete Question
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
                        Are you sure you want to delete this question? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <AlertDialogFooter className="flex gap-3 sm:justify-end">
                      <AlertDialogCancel className="mt-0 h-10 px-6 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteMutation.mutate({ id: q.id })}
                        className="h-10 px-6 rounded-lg bg-[#E11D48] text-white hover:bg-[#BE123C] font-semibold transition-colors flex items-center justify-center min-w-20"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}