import BikeEditSection from "@/components/bikes/bike-edit-section";
import ReservationSection from "@/components/bikes/reservation-section";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import DeleteReservationButton from "@/components/delete-reservation-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { compareDesc, format, isPast } from "date-fns";
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

type BikeDetailsPageProps = {
  params: { id: string };
};

export default async function BikeDetailsPage({
  params: { id: bikeId },
}: BikeDetailsPageProps) {
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
        <div className="grid grid-cols-3 gap-2">
          <BikeEditSection bike={bike} className="col-span-1" />
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>
                All {bike.name} - {bike.model} Reservations
              </CardTitle>
              <CardDescription>
                This is a list of all reservations for this bike made by users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  A list of all reservations for this bike.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-center">
                      User
                    </TableHead>
                    <TableHead>Strat Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Is Past</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bike.reservations
                    .sort((a, b) => compareDesc(a.startDate, b.startDate))
                    .map((res) => (
                      <TableRow
                        key={res.id}
                        className={cn({
                          "text-muted hover:text-muted-foreground": isPast(
                            res.endDate,
                          ),
                        })}
                      >
                        <TableCell className="font-medium">
                          {res.reservedBy.name ?? res.reservedBy.email}
                        </TableCell>
                        <TableCell>
                          {format(res.startDate, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(res.endDate, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {isPast(res.endDate) ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{res.rating ?? "N/A"}</TableCell>
                        <TableCell>
                          <DeleteReservationButton
                            reservation={res}
                            reservedBy={res.reservedBy}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">
                      Average Rating
                    </TableCell>
                    <TableCell>
                      {bike.reservations.filter((res) => !!res.rating)
                        .length === 0
                        ? "N/A"
                        : bike.reservations.reduce(
                            (acc, curr) => acc + (curr.rating ?? 0),
                            0,
                          ) /
                          bike.reservations.filter((res) => !!res.rating)
                            .length}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ReservationSection
          bike={bike}
          reservedDates={bike.reservations.map((resrv) => ({
            from: resrv.startDate,
            to: resrv.endDate,
          }))}
        />
      )}
    </DashboardShell>
  );
}
