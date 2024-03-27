"use client";

import { type Bike } from "@prisma/client";
import Link from "next/link";
import * as React from "react";

import { Icons } from "@/components/icons";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/client";
import { toast } from "sonner";

interface BikeOperationsProps {
  bike: Pick<Bike, "id" | "name">;
}

export function BikeOperations({ bike }: BikeOperationsProps) {
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false);

  const apiUtils = api.useUtils();

  const { mutateAsync: deleteBike, isLoading: isDeleteLoading } =
    api.bike.deleteBike.useMutation({
      onError(error, variables, context) {
        toast.error("Something went wrong.", {
          description: "Your bike was not deleted. Please try again.",
        });
      },
      async onSuccess(data, variables, context) {
        setShowDeleteAlert(false);
        toast.success("Bike deleted successfully.");
        await apiUtils.bike.invalidate();
      },
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <Icons.ellipsis className="h-4 w-4" />
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              prefetch
              href={`/bike/${bike.id}/edit`}
              className="flex w-full"
            >
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this bike?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={async () => await deleteBike({ id: bike.id })}
              >
                {isDeleteLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.trash className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
