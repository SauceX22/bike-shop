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
      title: "Home",
      href: "/home",
      icon: "home",
    },
    {
      title: "Bikes",
      href: "/bikes",
      icon: "bike",
      managerOnly: true,
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
