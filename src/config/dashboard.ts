import { type DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Bikes",
      href: "/home",
      icon: "bike",
    },
    {
      title: "Reservations",
      href: "/reservations",
      icon: "reservation",
    },
    {
      title: "Users",
      href: "/users",
      icon: "user",
      managerOnly: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "settings",
    },
  ],
};
