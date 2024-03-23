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
import UserEditSection from "@/components/users/user-edit-section";
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
  params: { id: userId },
}: {
  params: { id: string };
}): Promise<Metadata> {
  const session = await getServerAuthSession();
  const user = await api.user.getUser.query({ id: userId });
  const isManager = session?.user.role === "MANAGER";

  return {
    title: user?.name,
    description: isManager
      ? "Edit user details"
      : "View user details and reservations.",
  };
}

type UserDetailsPageProps = {
  params: { id: string };
};

export default async function UserDetailsPage({
  params: { id: userId },
}: UserDetailsPageProps) {
  unstable_noStore();
  const session = await getServerAuthSession();

  const userWithRes = await api.user.getUserWithReservations.query({
    id: userId,
  });

  if (!userWithRes) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={userWithRes.name ?? userWithRes.email}
        text={`Edit ${userWithRes.name ?? userWithRes.email}'s details`}
      />
      <div className="grid grid-cols-3 gap-2">
        <UserEditSection user={userWithRes} className="col-span-1" />
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              Reservations for {userWithRes.name ?? userWithRes.email}
            </CardTitle>
            <CardDescription>
              This is a list of all reservations for this user made by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                A list of all reservations for this user.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">Bike</TableHead>
                  <TableHead>Bike Model</TableHead>
                  <TableHead>Strat Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Is Past</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userWithRes.reservations
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
                      <TableCell>{res.bike.model}</TableCell>
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
                          reservedBy={userWithRes}
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
                    {userWithRes.reservations.filter((res) => !!res.rating)
                      .length === 0
                      ? "N/A"
                      : userWithRes.reservations.reduce(
                          (acc, curr) => acc + (curr.rating ?? 0),
                          0,
                        ) /
                        userWithRes.reservations.filter((res) => !!res.rating)
                          .length}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
