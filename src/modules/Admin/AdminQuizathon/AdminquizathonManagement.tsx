'use client';

import { useState } from "react"; 
import { trpc } from "@/trpc/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { CalendarDays, Trophy, Trash2, Loader2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog"; 

export function AdminRegistrations() {
  const utils = trpc.useUtils();
  const [registrations] = trpc.adminquizathon.getRegistrations.useSuspenseQuery();
  
  // ✅ Fixed type handling: id supports string | number to eliminate assignment mismatch errors
  const [confirmDelete, setConfirmDelete] = useState<{ 
    isOpen: boolean; 
    id: string | number | null; 
    name: string 
  }>({
    isOpen: false,
    id: null,
    name: ""
  });

  const deleteMutation = trpc.adminquizathon.deleteRegistration.useMutation({
    onMutate: (variables) => {
      const targetReg = registrations.find((r) => r.id === variables.registrationId);
      const targetName = targetReg ? `${targetReg.firstName ?? ''} ${targetReg.lastName ?? ''}`.trim() : "Participant";
      
      toast.loading(`Revoking registration for ${targetName}...`, { id: "delete-registration-toast" });
    },
    onSuccess: () => {
      toast.success("Registration Revoked Successfully", {
        id: "delete-registration-toast",
        description: "The database table records and dashboard lists have been synced.",
      });
      utils.adminquizathon.getRegistrations.invalidate();
    },
    onError: (err) => {
      toast.error("Operation Dismissed", {
        id: "delete-registration-toast",
        description: err.message || "Failed to remove user record from this session.",
      });
    }
  });

  const handleConfirmDelete = () => {
    if (confirmDelete.id === null) return;
    
    // ✅ Safe conversion fallback: handles routers configured for either string IDs or numeric IDs
    const targetedId = typeof confirmDelete.id === 'string' && !isNaN(Number(confirmDelete.id))
      ? Number(confirmDelete.id)
      : (confirmDelete.id as any);

    deleteMutation.mutate({ registrationId: targetedId });
    setConfirmDelete((prev) => ({ ...prev, isOpen: false })); 
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border overflow-hidden">
      <div className="p-6 border-b bg-slate-50/30">
        <h2 className="text-xl font-bold text-slate-800">Leaderboard & Participants</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-transparent">
            <TableHead className="font-bold">Participant</TableHead>
            <TableHead className="font-bold">Exam Date</TableHead>
            <TableHead className="font-bold">Subjects</TableHead>
            <TableHead className="font-bold">Performance</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => {
            const fullName = `${reg.firstName ?? ''} ${reg.lastName ?? ''}`.trim() || "User";
            const isDeleting = deleteMutation.isPending && deleteMutation.variables?.registrationId === reg.id;

            return (
              <TableRow key={reg.id} className={`transition-colors ${isDeleting ? "opacity-40 bg-red-50/50" : "hover:bg-slate-50/30"}`}>
                {/* 1. Participant Info */}
                <TableCell>
                  <Link href={`/profile/${reg.clerkId}`} className="flex items-center gap-3 group">
                    <UserAvatar imageUrl={reg.imageUrl} name={fullName} size={38} />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        {fullName}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </span>
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                       {reg.batchName ?? "Unassigned"}
                      </span>
                    </div>
                  </Link>
                </TableCell>

                {/* 2. Assigned Batch Date */}
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    {reg.batchDate ? format(new Date(reg.batchDate), "MMM do, yyyy") : "TBA"}
                  </div>
                </TableCell>

                {/* 3. Subjects List */}
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-50">
                    {reg.selectedSubjects.map((s) => (
                      <span 
                        key={String(s)} 
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase border border-slate-200"
                      >
                        {String(s).replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* 4. Performance (Score Ranking) */}
                <TableCell>
                  <div className="flex flex-col gap-1.5 w-32">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-black ${reg.score > 0 ? "text-indigo-600" : "text-slate-300"}`}>
                        {reg.score}%
                      </span>
                      {reg.score >= 90 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${
                          reg.score >= 70 ? "bg-green-500" : reg.score >= 40 ? "bg-amber-500" : "bg-indigo-500"
                        }`} 
                        style={{ width: `${Math.max(reg.score, 5)}%` }} 
                      />
                    </div>
                  </div>
                </TableCell>

                {/* 5. Actions */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={() => setConfirmDelete({ isOpen: true, id: reg.id, name: fullName })}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Reusable Radix Alert Dialog for Deletion Confirmation */}
      <AppAlertDialog 
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, isOpen: open }))}
        title="Revoke Registration"
        message={`Are you absolutely sure you want to remove ${confirmDelete.name} from this event? This action will cancel their examination seat assignment.`}
        buttonText="Remove Participant"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}