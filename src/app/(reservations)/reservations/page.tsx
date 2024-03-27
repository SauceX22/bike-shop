import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import DeleteReservationButton from "@/components/delete-reservation-button";
import { Icons } from "@/components/icons";
import { ReservationItem } from "@/components/reservation-item";
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
import { type Metadata } from "next";
import { unstable_noStore } from "next/cache";

export const metadata: Metadata = {
  title: "Reservations",
};

export default async function ReservationsPage() {
  unstable_noStore();
  const session = await getServerAuthSession();
  const isManager = session?.user.role === "MANAGER";
  const reservations = isManager
    ? await api.reservation.getAllReservations.query()
    : await api.reservation.getUserReservationsWithBikes.query();

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
      <div>
        {reservations?.length ? (
          isManager ? (
            <Table>
              <TableCaption>
                A list of all reservations made by users.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10rem] text-center">Bike</TableHead>
                  <TableHead className="w-[10rem] text-center">User</TableHead>
                  <TableHead>Strat Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Is Past</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations
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
                        {res.bike.name}
                      </TableCell>
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
                  <TableCell colSpan={5} className="text-right">
                    Average Rating
                  </TableCell>
                  <TableCell>
                    {reservations.filter((res) => !!res.rating).length === 0
                      ? "N/A"
                      : reservations.reduce(
                          (acc, curr) => acc + (curr.rating ?? 0),
                          0,
                        ) / reservations.filter((res) => !!res.rating).length}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <div className="grid gap-4 grid-cols-3">
              {reservations.map((reservation) => (
                <ReservationItem
                  key={reservation.id}
                  reservation={reservation}
                  bike={reservation.bike}
                />
              ))}
            </div>
          )
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
              {isManager
                ? "No Reservations"
                : "You don&apos;t have any reservations"}
            </h2>
            <p
              className={cn(
                "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
              )}
            >
              {isManager
                ? "No reservations made by users yet."
                : "You don&apos;t have any reservations yet. Rent a bike to get started."}
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
