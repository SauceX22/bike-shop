import { type Bike } from "@prisma/client";
import Link from "next/link";

import { BikeOperations } from "@/components/bike-operations";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface BikeItemProps {
  bike: Bike;
}

export function BikeItem({ bike }: BikeItemProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="grid gap-1">
        <Link
          href={`/bike/${bike.id}`}
          className="font-semibold hover:underline"
        >
          {bike.name}
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">
            {format(bike.createdAt, "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
      <BikeOperations bike={{ id: bike.id, name: bike.name }} />
    </div>
  );
}

BikeItem.Skeleton = function BikeItemSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};
