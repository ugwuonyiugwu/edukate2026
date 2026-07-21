import { HydrateClient, trpc } from "@/trpc/server";
import { LiveExamPortal } from "@/modules/home/Classes/Classview/ExamSession";
import { Suspense } from "react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export default async function Page(props: { 
  params: Promise<{ id: string; mode: 'practice' | 'exam' }> 
}) {
  const { id, mode } = await props.params;

  await trpc.classes.getById.prefetch({ id });
  await trpc.questions.getByClassId.prefetch({ classId: id });

  return (
    <HydrateClient>
       <Suspense fallback={<LoadingSpinner/>}>
        <LiveExamPortal classId={id} mode={mode} />
      </Suspense>
    </HydrateClient>
  );
}