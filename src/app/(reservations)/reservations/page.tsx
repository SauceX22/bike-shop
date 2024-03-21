import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/icons";
import { ReservationItem } from "@/components/reservation-item";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Create and manage your reservations.",
};

export default async function ReservationsPage() {
  const reservations =
    await api.reservation.getUserReservationsWithBikes.query();

  return (
    <DashboardShell>
      <DashboardHeader heading="Reservations" text="Manage your reservations" />
      <div>
        {reservations?.length ? (
          <div className="grid gap-4 grid-cols-3">
            {reservations.map((reservation) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                bike={reservation.bike}
              />
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
                <Icons.reservation className={cn("h-10 w-10")} />
              </div>
            </div>
            <h2 className={cn("mt-6 text-xl font-semibold")}>
              You don&apos;t have any reservations
            </h2>
            <p
              className={cn(
                "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
              )}
            >
              You don&apos;t have any reservations yet. Rent a bike to get
              started.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
