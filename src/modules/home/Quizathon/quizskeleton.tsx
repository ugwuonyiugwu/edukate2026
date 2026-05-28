// _components/quiz-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function QuizSkeleton() {
  return (
    <div className="w-full max-w-4xl bg-[#0a1128] rounded-3xl p-12 flex flex-col items-center">
      {/* The white countdown box skeleton */}
      <div className="bg-white/90 rounded-2xl p-8 w-full max-w-2xl flex justify-between mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="h-12 w-16 bg-slate-200" />
            <Skeleton className="h-4 w-10 bg-slate-100" />
          </div>
        ))}
      </div>
      {/* Title and Button Skeletons */}
      <Skeleton className="h-8 w-48 bg-slate-700 mb-2" />
      <Skeleton className="h-4 w-64 bg-slate-800 mb-6" />
      <Skeleton className="h-10 w-40 bg-slate-700 rounded-md" />
    </div>
  );
}