import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/icons";
import AddUserButton from "@/components/users/add-user-button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Add and manage your users.",
};

export default async function UsersPage() {
  const users = await api.user.getAll.query();

  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Add and manage users.">
        <AddUserButton />
      </DashboardHeader>
      <div>
        {users?.length ? (
          <div className="grid gap-4 grid-cols-3">
            {users.map((user) => (
              <p key={user.id}>{user.name}</p>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
            )}
          >
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Icons.user className={cn("h-10 w-10")} />
              </div>
            </div>
            <h2 className={cn("mt-6 text-xl font-semibold")}>
              No users created
            </h2>
            <p
              className={cn(
                "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
              )}
            >
              You don&apos;t have any users yet. Start creating content.
            </p>
            {/* <UserCreateButton variant="outline" /> */}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}