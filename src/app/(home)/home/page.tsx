import { redirect } from "next/navigation";

import { BikeItem } from "@/components/bike-item";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const bikes = await api.bike.getAvailableBikes.query();

  return (
    <DashboardShell>
      <DashboardHeader heading="Bikes" text="Create and manage bikes.">
        <Link href="/home/bikes/create">Create bike</Link>
      </DashboardHeader>
      <div>
        {bikes?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {bikes.map((bike) => (
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
            {/* <BikeCreateButton variant="outline" /> */}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
