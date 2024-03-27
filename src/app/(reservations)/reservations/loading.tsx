import { BikeItem } from "@/components/bike-item";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getServerAuthSession } from "@/server/auth";

export default async function DashboardLoading() {
  const session = await getServerAuthSession();
  const isManager = session?.user?.role === "MANAGER";
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Reservations"
        text={
          isManager
            ? "Manage reservations made by your users."
            : "Manager your reservations."
        }
      />
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
