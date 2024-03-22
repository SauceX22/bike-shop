import BikeEditSection from "@/components/bikes/bike-edit-section";
import ReservationSection from "@/components/bikes/reservation-section";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id: bikeId },
}: {
  params: { id: string };
}): Promise<Metadata> {
  const session = await getServerAuthSession();
  const bike = await api.bike.getBike.query({ id: bikeId });
  const isManager = session?.user.role === "MANAGER";

  return {
    title: bike?.name,
    description: isManager
      ? "Edit bike details"
      : "Reserve this bike for your next adventure.",
  };
}

export default async function BikeDetailsPage({
  params: { id: bikeId },
}: {
  params: { id: string };
}) {
  unstable_noStore();
  const session = await getServerAuthSession();
  const isManager = session?.user.role === "MANAGER";

  const bike = await api.bike.getBikeWithReservations.query({ id: bikeId });

  if (!bike) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={bike?.name}
        text={
          isManager
            ? "Edit bike details"
            : "Reserve this bike for your next adventure."
        }
      />
      {isManager ? (
        <BikeEditSection bikeId={bike.id} />
      ) : (
        <ReservationSection
          bike={bike}
          reservedDates={bike.reservations.map((resrv) => ({
            from: new Date(resrv.startDate),
            to: new Date(resrv.endDate),
          }))}
        />
      )}
    </DashboardShell>
  );
}
