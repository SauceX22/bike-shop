import { type User } from "@prisma/client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserOperations } from "@/components/users/user-operations";

interface UserItemProps {
  user: User;
}

export function UserItem({ user }: UserItemProps) {
  return (
    <Card className="flex items-center justify-between p-4">
      <CardHeader className="grid gap-1">{user.name}</CardHeader>
      <CardFooter>
        <UserOperations user={user} />
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
