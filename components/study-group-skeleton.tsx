import { Skeleton } from "@/components/ui/skeleton";

export const StudyGroupSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#FFC971] rounded-2xl p-8 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div>
                <Skeleton className="h-8 w-3/4 bg-black/10" />
                <Skeleton className="h-4 w-full mt-4 bg-black/10" />
                <Skeleton className="h-4 w-5/6 mt-2 bg-black/10" />
            </div>
            <div className="flex items-center justify-between mt-6">
                <Skeleton className="h-8 w-24 bg-black/10" />
                <Skeleton className="h-12 w-32 bg-black/10 rounded-xl" />
            </div>
        </div>
    ))}
  </div>
);