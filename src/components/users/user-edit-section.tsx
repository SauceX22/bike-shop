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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { type User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  user: User;
} & React.HTMLAttributes<HTMLDivElement>;

const UserEditSection = ({ user, className }: Props) => {
  const apiUtils = api.useUtils();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

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
      router.push("/users");
      router.refresh();
    },
  });

  return (
    <div className={cn("flex gap-2 w-full", className)}>
      <Card className="w-full flex flex-col">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Update user details and manage user state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                disabled={true}
                type="text"
                id="name"
                className="input"
                value={user.name ?? "User Hasn not set a name"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                disabled={true}
                type="email"
                id="email"
                className="input"
                value={user.email}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <Input
                disabled={true}
                type="text"
                id="role"
                className="input"
                value={user.role}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex flex-col gap-4 w-full">
          <AlertDialog
            open={showDisableDialog}
            onOpenChange={setShowDisableDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant={user.enabled ? "default" : "destructive"}
                className="w-full"
              >
                {user.enabled ? "User is Active" : "User is Disabled"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action may affect the user&apos;s ability to access the
                  system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(
                    buttonVariants({
                      variant: user.enabled ? "destructive" : "default",
                    }),
                  )}
                  onClick={async () => {
                    if (user.enabled) {
                      await setUserEnabledStatus({
                        id: user.id,
                        enabled: false,
                      });
                    } else {
                      await setUserEnabledStatus({
                        id: user.id,
                        enabled: true,
                      });
                    }
                  }}
                >
                  {user.enabled ? "Disable User" : "Enable User"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
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
                  <b>{user.name}&apos;s</b> information.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Delete</AlertDialogCancel>
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserEditSection;
