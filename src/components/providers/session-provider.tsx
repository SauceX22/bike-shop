"use client";

import {
  SessionProvider as NextSessionsProvider,
  type SessionProviderProps,
} from "next-auth/react";

export function SessionProvider({ children, ...props }: SessionProviderProps) {
  return <NextSessionsProvider {...props}>{children}</NextSessionsProvider>;
}
