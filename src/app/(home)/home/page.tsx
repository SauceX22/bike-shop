import { BikeItem } from "@/components/bike-item";
import FilterHeader from "@/components/bikes/filter-header";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFilteredBikes } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { type Metadata } from "next";
import { unstable_noStore } from "next/cache";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: {
    query?: string;
    queryType?: string;
    doaFrom?: string;
    doaTo?: string;
  };
}) {
  unstable_noStore();
  const session = await getServerAuthSession();
  const isManager = session?.user.role === "MANAGER";

  const filteredBikes = await getFilteredBikes(searchParams, {
    availableOnly: true,
  });

  return (
    <DashboardShell>
      <DashboardHeader heading="Home" text="Bikes available for rent.">
        <Link prefetch href="/reservations" className={cn(buttonVariants())}>
          {isManager ? "Manage User Reservations" : "View Your Reservations"}
        </Link>
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
              No bikes available
            </h2>
            <p
              className={cn(
                "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
              )}
            >
              There are no bikes available for rent at the moment. Please check
              back later.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
