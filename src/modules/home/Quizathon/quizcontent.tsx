'use client';

import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import Link from 'next/link'; 
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs'; 

export function QuizContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [quiz] = trpc.userquizathon.getLatestEvent.useSuspenseQuery();
  const { data: registrations, isLoading: isLoadingRegistrations } = 
    trpc.userquizathon.getUserRegistrations.useQuery(
      undefined, 
      { enabled: !!quiz && !!user }
    );

  if (!quiz) {
    return (
      <section className="w-full max-w-5xl bg-[#0a1128] rounded-sm p-8 md:p-16 text-center text-white shadow-2xl">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">No Active Quizathon</h1>
        <p className="text-base md:text-lg text-slate-300 mt-4">Check back soon for our next challenge!</p>
      </section>
    );
  }

  const { days, hours, minutes, seconds, isExpired } = useCountdown(quiz.registrationDeadline);
  const isRegistered = !!registrations && registrations.length > 0;
  const showDetailsView = isRegistered || isExpired;
  const buttonHref = showDetailsView 
    ? `/quizathon/details/${quiz.id}` 
    : '/quizathon/registeration';

  const checkingStatus = !isUserLoaded || isLoadingRegistrations;

  return (
    <section className="w-full max-w-5xl bg-[#0a1128] rounded-sm p-6 sm:p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
     
      {/* ⏰ Responsive Timer Container */}
      <div className="bg-white z-20 rounded-sm p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto flex flex-row items-center justify-between mb-8 shadow-inner gap-1 sm:gap-2">
        <TimeSegment value={days} label="Days" />
        <Divider />
        <TimeSegment value={hours} label="Hours" />
        <Divider />
        <TimeSegment value={minutes} label="Minutes" />
        <Divider />
        <TimeSegment value={seconds} label="Seconds" />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight px-2">{quiz.title}</h1>
        <div className="flex flex-col items-center gap-2">
           <p className="text-base sm:text-lg text-slate-300 font-medium ">
             Entry Fee: {quiz.pointCost} <span className="text-xl ">💎</span>
           </p>
           <p className="text-xs sm:text-sm text-blue-400">
             {isExpired ? "Registration has ended" : "Registration stops after countdown"}
           </p>
        </div>
        
        <div className="w-full max-w-sm mx-auto px-4">
          {checkingStatus ? (
            <Button disabled size="lg" className="mt-6 w-full bg-[#94a3b8]/50 text-[#0a1128] font-bold py-5 rounded-md">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </Button>
          ) : (
            <Link href="/quizathon/registeration" className="w-full block">
              <Button 
                size="lg"
                className={`mt-6 w-full md:w-auto font-bold px-6 md:px-10 py-5 md:py-7 rounded-md text-base sm:text-lg md:text-xl transition-all ${
                  showDetailsView
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg" 
                }`}
              >
                {showDetailsView ? "View Quiz Details" : "Register for Quizathon"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function TimeSegment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-black min-w-0">
      <div className="text-2xl sm:text-4xl md:text-6xl font-bold tabular-nums tracking-tight">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 mt-0.5 sm:mt-1 truncate">
        {label}
      </div>
    </div>
  );
}

const Divider = () => <div className="hidden sm:block h-12 md:h-16 w-0.5 bg-slate-200 mx-1 md:mx-4 shrink-0" />;