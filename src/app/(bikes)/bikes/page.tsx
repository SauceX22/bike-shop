import { BikeItem } from "@/components/bike-item";
import AddBikeButton from "@/components/bikes/add-bike-button";
import FilterHeader from "@/components/bikes/filter-header";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { areIntervalsOverlapping, isValid } from "date-fns";
import { isNumber } from "lodash";
import { type Metadata } from "next";
import { unstable_noStore } from "next/cache";

export const metadata: Metadata = {
  title: "Bikes",
};

export default async function BikesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: {
    query: string;
    queryType: string;
    doaFrom: string;
    doaTo: string;
  };
}) {
  unstable_noStore();
  const session = await getServerAuthSession();

  const query = searchParams.query;
  const queryType = searchParams.queryType;

  // search any property of the bike if queryType is all
  // otherwise search the specific property
  const bikes = await db.bike.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      reservations: true,
    },
    where: query
      ? {
          OR: [
            queryType === "all" || queryType === "name"
              ? {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            queryType === "all" || queryType === "model"
              ? {
                  model: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            queryType === "all" || queryType === "location"
              ? {
                  location: {
                    contains: query,
                    mode: "insensitive",
                  },
                }
              : {},
            (queryType === "all" || queryType === "ratingAvg") &&
            isNumber(query)
              ? {
                  averageRating: {
                    equals: parseFloat(query),
                  },
                }
              : {},
          ],
        }
      : undefined,
  });

  const isFilteringByDate =
    searchParams.doaFrom &&
    searchParams.doaTo &&
    isValid(new Date(searchParams.doaFrom)) &&
    isValid(new Date(searchParams.doaTo))
      ? true
      : false;

  console.log("isFilteringByDate", isFilteringByDate);

  const queryDateRange = {
    from: new Date(searchParams.doaFrom),
    to: new Date(searchParams.doaTo),
  };

  const filteredBikes = isFilteringByDate
    ? bikes.filter((bike) => {
        // filter by date of availability
        if (bike.reservations.length > 0) {
          const dateRangesNotAvailable = bike.reservations.map((resrv) => ({
            from: resrv.startDate,
            to: resrv.endDate,
          }));

          for (const dateRange of dateRangesNotAvailable) {
            // has to be available on the start, end and all in between days
            if (
              areIntervalsOverlapping(
                {
                  start: queryDateRange.from,
                  end: queryDateRange.to,
                },
                {
                  start: dateRange.from,
                  end: dateRange.to,
                },
                { inclusive: true },
              )
            ) {
              return false;
            }
          }
        }
        return true;
      })
    : bikes;

  return (
    <>
      <DashboardShell>
        <DashboardHeader heading="Bikes" text="Create and manage shop bikes.">
          <AddBikeButton />
        </DashboardHeader>
        <div className="px-2">
          <FilterHeader />
          <Separator className="my-4" />
          {filteredBikes?.length ? (
            <div className="grid gap-4 grid-cols-3">
              {filteredBikes.map((bike) => (
                <BikeItem key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
              )}
            >
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Icons.bike className={cn("h-10 w-10")} />
                </div>
              </div>
              <h2 className={cn("mt-6 text-xl font-semibold")}>
                No bikes created
              </h2>
              <p
                className={cn(
                  "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
                )}
              >
                You don&apos;t have any bikes yet. Start creating content.
              </p>
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  );
}
