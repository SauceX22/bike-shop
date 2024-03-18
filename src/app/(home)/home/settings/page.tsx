import { redirect } from "next/navigation";

import { UserNameForm } from "@/components/user-name-form";
import { getServerAuthSession } from "@/server/auth";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="grid gap-10">
      <UserNameForm user={{ id: session.user.id, name: session.user.name }} />
    </div>
  );
}
