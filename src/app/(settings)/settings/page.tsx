import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { buttonVariants } from "@/components/ui/button";
import { UserNameForm } from "@/components/user-name-form";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Reservations" text="Create and manage bikes.">
        <Link href="/bikes/create" className={cn(buttonVariants())}>
          Create bike
        </Link>
      </DashboardHeader>
      <UserNameForm user={{ id: session.user.id, name: session.user.name }} />
    </DashboardShell>
  );
}
