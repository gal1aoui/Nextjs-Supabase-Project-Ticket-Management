import { Skeleton } from "@/components/ui/skeleton";
import ProjectsCardSkeleton from "../projects-card-skeleton";

export default function ProjectDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-3 w-1/2 mb-12" />
      <ProjectsCardSkeleton style="h-48 rounded-xl mb-12" />
      <ProjectKanbanSkeleton />
    </>
  );
}

export function ProjectKanbanSkeleton() {
  return (
    <div className="px-8">
      <div className="flex justify-between mb-12 items-center">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-16 w-36" />
      </div>
      <ProjectsCardSkeleton length={4} style="h-[512px] rounded-xl mb-12" />
    </div>
  );
}
