import { HydrateClient, trpc } from "@/trpc/server"; 
import { ClassroomView } from "@/modules/home/Classes/Classview/classroom";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

// Ensure params is treated as a Promise
export default async function Page(props: { params: Promise<{ id: string }> }) {
  // 1. Await the params first
  const { id } = await props.params;

  if (!id) {
    return <div>Invalid Class ID</div>;
  }

  try {
    await trpc.classes.getById.prefetch({ id });
    await trpc.questions.getByClassId.prefetch({ classId: id });
  } catch (error) {
    console.error("Prefetch error:", error);
  }

  return (
    <HydrateClient>
       <Suspense fallback={<LoadingSpinner/>}>
        <ClassroomView classId={id} />
      </Suspense>
    </HydrateClient>
  );
}