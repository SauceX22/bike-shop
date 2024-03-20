"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { type Bike, type Reservation } from "@prisma/client";
import { format, isSameYear } from "date-fns";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ReservationItemProps {
  reservation: Reservation;
  bike: Bike;
}

export function ReservationItem({ reservation, bike }: ReservationItemProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const apiUtils = api.useUtils();

  const { mutateAsync: cancelReservation } =
    api.reservation.cancelReservation.useMutation({
      onError(err) {
        toast.error("Something went wrong.", {
          description: err.message,
        });
      },
      async onSuccess(data, variables, context) {
        toast.success("Reservation canceled", {
          description: `Reservation for *${bike.name}* from ${format(
            reservation.startDate,
            "d MMM yyyy",
          )} to ${format(reservation.endDate, "d MMM yyyy")} canceled successfully.`,
        });

        await apiUtils.reservation.invalidate();
        router.refresh();
      },
    });

  const differentYear = !isSameYear(
    reservation.startDate ?? new Date(),
    reservation.endDate ?? new Date(),
  );

  return (
    <>
      <Card className="h-[22rem] flex flex-col">
        <CardHeader>
          <CardTitle>{bike.name}</CardTitle>
          <CardDescription>{bike.model}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-stretch justify-center gap-4">
          <div className="flex flex-row items-center justify-between mb-auto px-6 py-2">
            <span className="text-secondary-foreground flex-shrink-0 flex gap-2 w-fit">
              <MapPin className="w-6 h-6" />
              {bike.location}
            </span>
            <span
              className="rounded-full h-8 w-8"
              style={{ backgroundColor: bike.color }}
            ></span>
          </div>
          <Card>
            {/* make the column in the middle the smallest */}
            <CardContent className="grid grid-cols-3 grid-rows-1 p-4 gap-4 ">
              <div className="mx-auto">
                Start Date
                <p className="font-semibold text-xl">
                  {format(
                    reservation.startDate ?? new Date(),
                    `dd MMM ${differentYear ? "yyyy" : ""}`,
                  )}
                </p>
              </div>
              <Separator
                orientation="vertical"
                decorative
                className="mx-auto w-[1px] h-full"
              />
              <div className="mx-auto">
                End Date
                <p className="font-semibold text-xl">
                  {format(
                    reservation.endDate ?? new Date(),
                    `dd MMM ${differentYear ? "yyyy" : ""}`,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Reservation
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel
              {bike.name}&apos;s reservation for{" "}
              {format(reservation.startDate, "d MMM yyyy")} to{" "}
              {format(reservation.endDate, "d MMM yyyy")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={async () => {
                await cancelReservation({
                  id: reservation.id,
                });
              }}
            >
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

ReservationItem.Skeleton = function ReservationItemSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};
