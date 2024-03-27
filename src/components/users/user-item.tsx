import { type User } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserAvatar } from "../user-avatar";

interface UserItemProps {
  user: User;
}

export function UserItem({ user }: UserItemProps) {
  return (
    <Card className="flex items-center justify-between p-2">
      <CardHeader className="flex flex-row items-center justify-start text-xl font-bold gap-4 flex-shrink-0">
        <UserAvatar user={user} />
        {user.name}
      </CardHeader>
      <CardContent className="flex flex-row h-full w-full justify-between gap-8 items-center p-4">
        <span className="text-sm font-normal text-muted-foreground text-left">
          {user.email}
        </span>
        <span
          className={cn(
            "text-sm font-normal",
            user.enabled ? "text-green-500" : "text-red-500",
          )}
        >
          {user.enabled ? "Enabled" : "Disabled"}
        </span>
      </CardContent>
      <CardFooter className="p-4">
        {/* <UserOperations user={user} className="my-auto" /> */}
        <Link
          prefetch
          href={`/users/${user.id}`}
          className={cn(buttonVariants(), "w-full")}
        >
          View
        </Link>
      </CardFooter>
    </Card>
  );
}

UserItem.Skeleton = function UserItemSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};
