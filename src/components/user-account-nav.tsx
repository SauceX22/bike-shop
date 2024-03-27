"use client";

import { type User } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { dashboardConfig } from "@/config/dashboard";
import { cn } from "@/lib/utils";

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar user={{ ...user }} className="h-8 w-8" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={
          user.role === "MANAGER"
            ? "border border-dashed border-orange-500"
            : ""
        }
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
            <Badge
              variant="default"
              className={cn(
                "flex justify-center items-center rounded-md text-xs w-full flex-shrink-0 py-1 pointer-events-none",
                user.role === "MANAGER" ? "bg-orange-500" : "",
              )}
            >
              {user.role}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        {dashboardConfig.sidebarNav.map((item, idx) => {
          if (item.managerOnly && user.role !== "MANAGER") {
            return null;
          }

          return (
            <DropdownMenuItem key={idx} asChild>
              <Link prefetch href={item.href}>
                {item.title}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            void signOut({
              callbackUrl: `${window.location.origin}/auth/login`,
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
