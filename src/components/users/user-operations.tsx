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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { api } from "@/trpc/client";
import { type User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UserOperationsProps = {
  user: User;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function UserOperations({ user, className }: UserOperationsProps) {
  const router = useRouter();
  const apiUtils = api.useUtils();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutateAsync: setUserEnabledStatus } =
    api.user.setUserEnabledStatus.useMutation({
      onError(err) {
        toast.error("Something went wrong.", {
          description: err.message,
        });
      },
      async onSuccess(data, variables, context) {
        toast.success("User updated", {
          description: `User *${user.name}* enabled status updated to ${data.enabled} successfully.`,
        });

        await apiUtils.user.invalidate();
        router.refresh();
      },
    });

  const { mutateAsync: deleteUser } = api.user.deleteUser.useMutation({
    onError(err) {
      toast.error("Something went wrong.", {
        description: err.message,
      });
    },
    async onSuccess(data, variables, context) {
      toast.success("User deleted", {
        description: `User *${user.name}* deleted successfully.`,
      });

      await apiUtils.user.invalidate();
      router.refresh();
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>User Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={user.enabled}
            onClick={async () => {
              await setUserEnabledStatus({
                id: user.id,
                enabled: !user.enabled,
              });
            }}
          >
            Enabled
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowDeleteDialog(true);
            }}
            variant="destructive"
          >
            Delete
            <DropdownMenuShortcut>Delete</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {user.name}&apos;s account and remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={async () => {
                await deleteUser({
                  id: user.id,
                });
              }}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
}
