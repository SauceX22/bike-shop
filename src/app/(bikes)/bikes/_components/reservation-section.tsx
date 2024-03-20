"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/client";
import { type Bike } from "@prisma/client";
import { areIntervalsOverlapping, format, isSameYear } from "date-fns";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

type Props = {
  bike: Bike;
  reservedDates: DateRange[];
};

const ReservationSection = ({ bike, reservedDates }: Props) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [isOverlapping, setIsOverlapping] = useState(false);

  const differentYear = !isSameYear(
    date?.from ?? new Date(),
    date?.to ?? new Date(),
  );

  const { mutateAsync: reserveBike } = api.bike.reserveBike.useMutation({
    onError: (error) => {
      toast.error("Something went wrong.", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Bike reserved successfully!", {
        description: "You can view your reservations in your dashboard.",
      });
    },
  });

  function setDateNoOverlap(dateRange: DateRange | undefined) {
    if (!dateRange?.from || !dateRange?.to) return;
    setIsOverlapping(false);
    // check if the selected date range is overlapping with any of the reserved dates
    for (const reservation of reservedDates) {
      if (
        reservation.from &&
        reservation.to &&
        areIntervalsOverlapping(
          {
            start: dateRange.from,
            end: dateRange.to,
          },
          {
            start: reservation.from,
            end: reservation.to,
          },
        )
      ) {
        setIsOverlapping(true);
        toast.error(
          "Bike is already reserved for all/part of the selected dates.",
          {
            duration: 2000,
          },
        );
      }
    }
    setDate(dateRange);
  }

  useEffect(() => {
    setDateNoOverlap(date);
  }, []);

  return (
    <div className="flex gap-2 w-full">
      <div className="w-fit">
        <Calendar
          mode="range"
          selected={date}
          onSelect={setDateNoOverlap}
          disabled={reservedDates}
          className="rounded-md border"
        />
      </div>
      <Card className="w-full flex flex-col">
        <CardHeader>
          <CardTitle>Bike Reservation Details</CardTitle>
          <CardDescription>
            The following reservation is editable until the day of the
            reservation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card>
            {/* make the column in the middle the smallest */}
            <CardContent className="grid grid-cols-3 grid-rows-1 p-4 gap-4 ">
              <div className="mx-auto">
                Start Date
                <p className="font-bold text-xl">
                  {format(
                    date?.from ?? new Date(),
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
                <p className="font-bold text-xl">
                  {format(
                    date?.to ?? new Date(),
                    `dd MMM ${differentYear ? "yyyy" : ""}`,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="mt-auto">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-full"
                  size="default"
                  disabled={!date?.from || !date?.to || isOverlapping}
                  onClick={async () => {
                    if (!date?.from || !date?.to) return;

                    await reserveBike({
                      id: bike.id,
                      startDate: date.from,
                      endDate: date.to,
                    });
                  }}
                >
                  Reserve {bike.name} - {bike.model}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isOverlapping
                    ? "Please select a different date range."
                    : "Reserve the bike for the selected dates."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReservationSection;
