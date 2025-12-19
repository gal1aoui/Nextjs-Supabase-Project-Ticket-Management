import { Skeleton } from "../ui/skeleton";

export default function ProjectsCardSkeleton({
  style = "h-64 w-full rounded-xl",
  length = 3,
}: {
  style?: string;
  length?: number;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-${length - 1} lg:grid-cols-${length}`}
    >
      {Array.from({ length }).map((_, index) => {
        return <Skeleton key={index.toString()} className={style} />;
      })}
    </div>
  );
}
