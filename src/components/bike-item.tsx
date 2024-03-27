import { type Bike } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { format } from "date-fns";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

interface BikeItemProps {
  bike: Bike;
}

export async function BikeItem({ bike }: BikeItemProps) {
  const session = await getServerAuthSession();
  const isManager = session?.user.role === "MANAGER";

  return (
    <Card className="h-80 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>{bike.name}</CardTitle>
        <CardDescription>{bike.model}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 grid-rows-2 items-center justify-between h-full px-6 py-2">
        <span className="text-muted-foreground text-sm col-span-2">
          <b>Date Added</b> {format(bike.createdAt, "dd MMM yyyy")}
        </span>
        <span className="text-secondary-foreground flex-shrink-0 flex gap-2 w-fit">
          <MapPin className="w-6 h-6" />
          {bike.location}
        </span>
        <span
          className="rounded-full h-8 w-8"
          style={{ backgroundColor: bike.color }}
        ></span>
        <span className="text-secondary-foreground flex-shrink-0 flex gap-2 w-fit">
          <Star className="w-6 h-6" />
          {bike.averageRating}
        </span>
      </CardContent>
      <CardFooter className="mt-4">
        {isManager ? (
          <div className="flex flex-col gap-4 w-full">
            <Link
              prefetch
              href={`/bikes/${bike.id}`}
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "w-full",
              )}
            >
              Edit
            </Link>
          </div>
        ) : (
          <Link
            prefetch
            href={`/bikes/${bike.id}`}
            className={cn(buttonVariants(), "w-full")}
          >
            Reserve
          </Link>
        )}
      </CardFooter>
    </Card>
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
