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
import { RatingGroup } from "@/components/ui/rating";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ratingSchema } from "@/lib/validations/general";
import { api } from "@/trpc/client";
import { type Bike, type Reservation } from "@prisma/client";
import { format, isSameYear } from "date-fns";
import { debounce } from "lodash"; // Ensure lodash's debounce is correctly imported
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ReservationItemProps {
  reservation: Reservation;
  bike: Bike;
}

export function ReservationItem({ reservation, bike }: ReservationItemProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const apiUtils = api.useUtils();
  // debounce the rating change to avoid spamming the server
  const { mutateAsync: rateBike } = api.reservation.rateBike.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(rating, variables, context) {
      toast.success("Rating submitted", {
        description: `Rating for *${bike.name}* from ${format(
          reservation.startDate,
          "d MMM yyyy",
        )} to ${format(reservation.endDate, "d MMM yyyy")} submitted successfully.`,
      });
      await apiUtils.reservation.invalidate();
      router.refresh();
    },
  });

  // Create the debounced function with useCallback to ensure it does not get recreated on every render
  const debouncedRateBike = debounce(async (value: number) => {
    const result = ratingSchema.safeParse(value);
    if (result.success) {
      await rateBike({
        id: reservation.id,
        rating: result.data,
      });
    }
  }, 1000); // Debounce time is 1500ms

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

  const differentYear = useMemo(() => {
    return !isSameYear(
      reservation.startDate ?? new Date(),
      reservation.endDate ?? new Date(),
    );
  }, [reservation.startDate, reservation.endDate]);

  return (
    <>
      <Card className="h-[25rem] flex flex-col">
        <CardHeader>
          <CardTitle>{bike.name}</CardTitle>
          <CardDescription>{bike.model}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-stretch justify-center gap-4 py-0">
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
            <CardContent className="grid grid-cols-3 grid-rows-1 px-4 py-2 gap-4">
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
          <div className="flex flex-col">
            {reservation.rating ? (
              <p className="text-center">
                You rated this bike {reservation.rating} stars
              </p>
            ) : (
              <p className="text-center text-destructive">
                This bike has not been rated yet
              </p>
            )}
            <RatingGroup
              ratingSteps={5}
              className="mx-auto  "
              defaultValue={reservation.rating ?? 0}
              value={reservation.rating ?? 0}
              onValueChange={async (value) => {
                await debouncedRateBike(value);
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel{" "}
              <b>{bike.name}&apos;s</b>
              reservation for
              <b>{format(reservation.startDate, "d MMM yyyy")}</b>
              to <b>{format(reservation.endDate, "d MMM yyyy")}.</b>
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
