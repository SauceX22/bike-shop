import { BikeItem } from "@/components/bike-item";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import Link from "next/link";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Bikes" text="Create and manage bikes.">
        <Link href="/bikes/create">Create bike</Link>
      </DashboardHeader>
      <div className="divide-border-200 divide-y rounded-md border">
        <BikeItem.Skeleton />
        <BikeItem.Skeleton />
        <BikeItem.Skeleton />
        <BikeItem.Skeleton />
        <BikeItem.Skeleton />
      </div>
    </DashboardShell>
  );
}
