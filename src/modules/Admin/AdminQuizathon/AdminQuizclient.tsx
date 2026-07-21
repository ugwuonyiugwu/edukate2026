'use client';

import { useState, Suspense } from "react";
import { trpc } from "@/trpc/client";
import { AdminRegistrations } from "./AdminquizathonManagement";
import { AdminQuizForm } from "./AdminQuizForm";
import { BatchManagementModal } from "./BatchManagementModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2 } from "lucide-react";

export function AdminQuizClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeEvent] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();

  return (
    <div className="min-h-screen bg-slate-50 p-1 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Quizathon Management
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Currently managing: <span className="text-indigo-600 font-bold">{activeEvent?.title || "No Active Event"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeEvent && (
              <BatchManagementModal quizEventId={activeEvent.id} />
            )}

            {/* 2. Event Settings Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2 shadow-md rounded-xl">
                  <Settings2 className="w-4 h-4" /> Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-125 rounded-sm">
                <DialogHeader>
                  <DialogTitle>Quizathon Configuration</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>}>
                  <AdminQuizForm onSuccess={() => setIsDialogOpen(false)} />
                </Suspense>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AdminRegistrations />
      </div>
    </div>
  );
}