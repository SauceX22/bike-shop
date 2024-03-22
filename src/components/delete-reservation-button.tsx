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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { type Reservation, type User } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  reservation: Reservation;
  reservedBy: User;
};

const DeleteReservationButton = ({ reservation, reservedBy }: Props) => {
  const apiUtils = api.useUtils();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!reservation) {
    return notFound();
  }

  const { mutateAsync: deleteReservation } =
    api.reservation.cancelReservation.useMutation({
      onError(err) {
        toast.error("Something went wrong.", {
          description: err.message,
        });
      },
      async onSuccess(data, variables, context) {
        toast.success("Reservation deleted", {
          description: `Reservation for user *${reservedBy.name}* deleted successfully.`,
        });

        await apiUtils.reservation.invalidate();
        router.refresh();
      },
    });

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <b>{reservedBy.name}&apos;s</b> reservation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Delete</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={async () => {
              await deleteReservation({
                id: reservation.id,
              });
            }}
          >
            Delete Reservation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteReservationButton;
