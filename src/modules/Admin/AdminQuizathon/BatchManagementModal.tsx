'use client';

import { useState } from "react";
import { trpc } from "@/trpc/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, Loader2, Pencil, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner"; // 👈 Imported Sonner toast provider
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

export function BatchManagementModal({ quizEventId }: { quizEventId: number }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(50);

  const utils = trpc.useUtils();
  
  // Admin Query Hook
  const { data: batches, isLoading } = trpc.adminquizathon.getBatchesByEvent.useQuery({ quizEventId });

  // ⚡ Create Batch Mutation with Toast notifications
  const createMutation = trpc.adminquizathon.createBatch.useMutation({
    onMutate: () => {
      toast.loading("Creating new execution batch...", { id: "create-batch" });
    },
    onSuccess: () => {
      toast.success("Batch created successfully!", {
        id: "create-batch",
        description: `Batch "${name}" has been added to the register.`,
      });
      utils.adminquizathon.getBatchesByEvent.invalidate();
      resetForm();
    },
    onError: (err) => {
      toast.error("Failed to create batch", {
        id: "create-batch",
        description: err.message || "Something went wrong while executing creation.",
      });
    }
  });

  // ⚡ Update Batch Mutation with Toast notifications
  const updateMutation = trpc.adminquizathon.updateBatch.useMutation({
    onMutate: () => {
      toast.loading("Updating batch configurations...", { id: "update-batch" });
    },
    onSuccess: () => {
      toast.success("Batch updated successfully!", {
        id: "update-batch",
        description: "Your structural edits have been persisted safely.",
      });
      utils.adminquizathon.getBatchesByEvent.invalidate();
      utils.adminquizathon.getRegistrations.invalidate(); 
      resetForm();
    },
    onError: (err) => {
      toast.error("Failed to update batch", {
        id: "update-batch",
        description: err.message || "Database configuration updates were rejected.",
      });
    }
  });

  // ⚡ Delete Batch Mutation with Toast notifications
  const deleteMutation = trpc.adminquizathon.deleteBatch.useMutation({
    onMutate: () => {
      toast.loading("Purging batch record safely...", { id: "delete-batch" });
    },
    onSuccess: () => {
      toast.success("Batch successfully destroyed", {
        id: "delete-batch",
        description: "The batch entry allocation map has been cleanly removed.",
      });
      utils.adminquizathon.getBatchesByEvent.invalidate();
      utils.adminquizathon.getRegistrations.invalidate();
    },
    onError: (err) => {
      toast.error("Action Aborted", {
        id: "delete-batch",
        description: err.message || "This batch could not be removed safely.",
      });
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDate("");
    setCapacity(50);
  };

  const handleAction = () => {
    if (!name || !date) return;
    
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name,
        quizDate: new Date(date),
        maxCapacity: capacity,
      });
    } else {
      createMutation.mutate({ quizEventId, name, quizDate: new Date(date), maxCapacity: capacity });
    }
  };

  const startEditing = (batch: any) => {
    setEditingId(batch.id);
    setName(batch.name);
    setDate(new Date(batch.quizDate).toISOString().split('T')[0]);
    setCapacity(batch.maxCapacity);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl">
          <Plus className="w-4 h-4" /> Manage Batches
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-125 rounded-sm bg-white p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Batch" : "Examination Batches"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Modify batch details or create new slots.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}

        {!editingId && batches && batches.length > 0 && (
          <div className="space-y-3 max-h-19 overflow-y-auto pr-1 my-2 scrollbar-thin scrollbar-thumb-slate-200">
            {batches.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 h-16 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-700 truncate">{b.name} <span className="text-[10px] text-slate-400 font-normal ml-1">({b.maxCapacity} seats)</span></p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <CalendarIcon className="w-3 h-3 shrink-0" /> {format(new Date(b.quizDate), "PPP")}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => startEditing(b)} className="text-slate-400 hover:text-indigo-600 w-8 h-8 rounded-lg">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-100 rounded-sm bg-white p-6 shadow-2xl border-none">
                      <AlertDialogHeader className="space-y-3">
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">
                          Delete Batch
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
                          Are you sure you want to delete <strong className="text-slate-700 font-semibold">{b.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-3 sm:justify-end">
                        <AlertDialogCancel className="mt-0 h-10 px-6 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteMutation.mutate({ id: b.id })}
                          className="h-10 px-6 rounded-lg bg-[#E11D48] text-white hover:bg-[#BE123C] font-semibold transition-colors flex items-center justify-center min-w-20"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Details Block */}
        <div className="grid gap-4 py-4 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
               {editingId ? "Editing Mode" : "New Batch Details"}
             </span>
             {editingId && (
               <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[10px] gap-1 hover:bg-slate-200/60 rounded-md">
                 <X className="w-3 h-3" /> Cancel Edit
               </Button>
             )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-xs font-bold text-slate-500">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Batch A" className="col-span-3 rounded-xl border-none shadow-sm focus-visible:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-xs font-bold text-slate-500">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3 rounded-xl border-none shadow-sm focus-visible:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-xs font-bold text-slate-500">Limit</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="col-span-3 rounded-xl border-none shadow-sm focus-visible:ring-indigo-500" />
          </div>
        </div>

        <Button 
          onClick={handleAction} 
          disabled={createMutation.isPending || updateMutation.isPending || !name || !date}
          className={`w-full rounded-2xl h-12 font-bold text-white shadow-lg transition-all ${
            editingId 
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-100" 
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100"
          }`}
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
          ) : (
            editingId ? "Update Batch Information" : "Confirm New Batch"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}