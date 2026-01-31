import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-col w-full mb-2">
      <Skeleton/>
      <Skeleton className="h-[300]"/> 
    </div>
  )
}
