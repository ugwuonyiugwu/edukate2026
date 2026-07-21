'use client';

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Loader2, Info, Check, ChevronsUpDown, X, BookOpen, Calendar, Layers, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";

export function SubjectSelectionForm() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  
  const [quiz] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();
  const utils = trpc.useUtils();

  const { data: registrations, isLoading: isLoadingRegistrations } = 
    trpc.userquizathon.getUserRegistrations.useQuery(
      undefined, 
      { enabled: !!quiz && !!user }
    );

  const userRegistration = registrations?.find((reg) => reg.clerkId === user?.id);
  const isRegistered = !!userRegistration;

  const [currentTickTime, setCurrentTickTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const serverNow = userRegistration?.serverCurrentTimestamp; 
  const targetTimestamp = userRegistration?.examTargetTimestamp;

  useEffect(() => {
    if (!serverNow || !targetTimestamp) return;

    let internalClock = serverNow;
    setCurrentTickTime(internalClock);

    const updateCountdown = () => {
      internalClock += 1000; 
      setCurrentTickTime(internalClock);

      const difference = targetTimestamp - internalClock;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [serverNow, targetTimestamp]);

  const isExamTimeLive = !!targetTimestamp && !!currentTickTime && currentTickTime >= targetTimestamp;

  const mutation = trpc.userquizathon.register.useMutation({
    onMutate: () => {
      toast.loading("Processing your registration entry...", { id: "quiz-register-toast" });
    },
    onSuccess: () => {
      toast.success("Registration Confirmed!", {
        id: "quiz-register-toast",
        description: `Successfully deducted ${quiz?.pointCost ?? 0} PT. Your seat has been assigned.`,
      });

      utils.userquizathon.getUserRegistrations.invalidate();
      utils.userquizathon.getLatestEvent.invalidate();
    },
    onError: (err) => {
      toast.error("Registration Dismissed", {
        id: "quiz-register-toast",
        description: err.message || "Registration for this event has closed.",
      });

      setAlert({
        isOpen: true,
        title: "Registration Failure",
        message: err.message || "Registration for this event has closed."
      });
    }
  });

  const handleSelect = (subject: string) => {
    if (selected.includes(subject)) {
      setSelected(selected.filter((s) => s !== subject));
    } else if (selected.length < 4) {
      setSelected([...selected, subject]);
    }
  };

  const removeSubject = (subject: string) => {
    setSelected(selected.filter((s) => s !== subject));
  };

  const isComplete = selected.length === 4;

  const handleRegistrationSubmit = () => {
    if (selected.length !== 4) {
      toast.warning("Incomplete Selection", {
        description: "Please pick exactly 4 core subjects before proceeding."
      });
      return;
    }
    
    mutation.mutate({ 
      selectedSubjects: [selected[0], selected[1], selected[2], selected[3]] 
    });
  };

  const loadingStatus = !isUserLoaded || isLoadingRegistrations || (isRegistered && currentTickTime === null);

  if (loadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white rounded-3xl border border-slate-100 max-w-2xl mx-auto shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Synchronizing with secure server time...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white rounded-3xl border border-slate-100 max-w-2xl mx-auto text-center shadow-sm">
        <Info className="w-8 h-8 text-slate-400 mb-2" />
        <h3 className="font-black text-slate-700">No Active Event</h3>
        <p className="text-xs text-slate-400 mt-1">There are no registration portals active at this time.</p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="bg-white rounded-sm shadow-xl border mt-6 border-slate-100 overflow-hidden w-full max-w-2xl mx-auto transition-all">
        <div className="bg-blue-600 p-5 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                <Check className="w-3 h-3 stroke-3" /> Registration Verified
              </div>
              <h1 className="text-xl sm:text-2xl font-black">{quiz.title}</h1>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right shrink-0 bg-blue-700/40 border border-white/10 p-3 rounded-xl sm:min-w-38.75 flex flex-col justify-center min-h-14.5">
              {!targetTimestamp ? (
                <div className="flex items-center sm:justify-end gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider italic">Pending...</span>
                </div>
              ) : !isExamTimeLive ? (
                <div>
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-blue-200">Exam Starts In</span>
                  <span className="text-xs sm:text-sm font-mono font-black tracking-tight text-white block mt-0.5">
                    {timeLeft.days}d:{String(timeLeft.hours).padStart(2, '0')}h:{String(timeLeft.minutes).padStart(2, '0')}m:{String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              ) : (
                <div className="flex items-center sm:justify-end gap-1.5 text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider">Exam Live</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-sm shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Slot</span>
                <span className="text-sm mt-0.5 block font-black text-slate-800 truncate">
                  {userRegistration.batchName ?? "Unassigned Batch"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-sm shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Examination Date</span>
                <span className="text-sm mt-0.5 block font-black text-slate-800 truncate">
                  {targetTimestamp 
                    ? `${format(new Date(targetTimestamp), "PPP")}` 
                    : "Awaiting Schedule"
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border border-slate-100 rounded-sm bg-slate-50/50 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Registered Subjects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userRegistration.selectedSubjects.map((subject, index) => (
                <div key={subject} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-sm shadow-sm min-w-0">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              if (isExamTimeLive) {
                router.push(`/quizathon/exam?eventId=${quiz.id}`);
              }
            }}
            disabled={!isExamTimeLive}
            className={cn(
              "w-full h-12 sm:h-14 text-xs sm:text-sm font-black uppercase tracking-wider rounded-sm shadow-lg transition-all",
              isExamTimeLive 
                ? "bg-green-600 hover:bg-green-700 text-white animate-bounce shadow-green-200" 
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            )}
          >
            {isExamTimeLive ? "Go to Quiz Dashboard (Exam Active)" : "Dashboard Locked (Awaiting Exam Time)"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden w-full max-w-2xl mx-auto relative">
      <div className="bg-indigo-600 p-5 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{quiz.title}</h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" /> Choose your 4 core subjects
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="block text-[10px] uppercase font-bold opacity-70">Entry Fee</span>
            <span className="text-lg sm:text-xl font-black">{quiz.pointCost} PT</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Select Subjects</label>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-12 sm:h-14 rounded-sm border-slate-200 hover:bg-slate-50 transition-all text-slate-600 targets-combobox text-xs sm:text-sm"
                  disabled={isComplete && !open}
                >
                  {selected.length > 0 
                    ? `${selected.length} subjects selected` 
                    : "Click to browse subjects..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-sm overflow-hidden" align="start">
                <Command loop>
                  <CommandInput placeholder="Search subjects..." className="h-12" />
                  <CommandList>
                    <CommandEmpty>No subject found.</CommandEmpty>
                    <CommandGroup>
                      {quiz.subjects.map((subject) => {
                        const isSelected = selected.includes(subject);
                        const isDisabled = !isSelected && isComplete;
                        
                        return (
                          <CommandItem
                            key={subject}
                            value={subject.toLowerCase()} 
                            onSelect={() => {
                              if (!isDisabled) handleSelect(subject);
                            }}
                            className={cn(
                              "flex items-center justify-between py-3 px-4 cursor-pointer text-xs sm:text-sm",
                              isSelected && "bg-indigo-50 text-indigo-700 font-bold",
                              isDisabled && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="font-medium text-slate-700 truncate">{subject}</span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="min-h-25 p-3 sm:p-4 bg-slate-50 rounded-sm border-2 border-dashed border-slate-200">
            {selected.length === 0 ? (
              <p className="text-slate-400 text-xs sm:text-sm text-center py-6">Your selections will appear here</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((s) => (
                  <Badge 
                    key={s} 
                    variant="secondary"
                    className="bg-white text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-sm shadow-sm flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer group text-xs sm:text-sm max-w-full truncate"
                    onClick={() => removeSubject(s)}
                  >
                    <span className="truncate">{s}</span>
                    <X className="w-3 h-3 text-slate-400 group-hover:text-red-500 shrink-0" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-tight">
              Selection Progress
            </span>
            <div className={cn(
              "px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black",
              isComplete ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"
            )}>
              {selected.length} / 4
            </div>
          </div>

          <Button
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isComplete || mutation.isPending}
            onClick={handleRegistrationSubmit}
          >
            {mutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </div>
      </div>

      <AppAlertDialog 
        isOpen={alert.isOpen}
        onOpenChange={(open) => setAlert(prev => ({ ...prev, isOpen: open }))}
        title={alert.title}
        message={alert.message}
      />
    </div>
  );
}