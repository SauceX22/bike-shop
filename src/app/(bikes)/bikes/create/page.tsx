import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

import ReservationSection from "@/app/(bikes)/bikes/_components/reservation-section";

type Props = {
  params: { id: string };
};

export default async function CreateBikePage({
  params: { id: bikeId },
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  const bike = await api.bike.getBikeWithReservations.query({ id: bikeId });

  if (!bike) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={bike?.name}
        text="Reserve this bike for your next adventure."
      />
      <div>
        <ReservationSection
          bike={bike}
          reservedDates={bike.reservations.map((resrv) => ({
            from: new Date(resrv.startDate),
            to: new Date(resrv.endDate),
          }))}
        />
      </div>
    </DashboardShell>
  );
}