import { Prisma, PrismaClient } from "@prisma/client";

import { env } from "@/env.mjs";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export type Models = keyof typeof Prisma.ModelName;

export type ArgsType<T extends Models> =
  Prisma.TypeMap["model"][T]["operations"]["findMany"]["args"];

export type WhereType<T extends Models> = NonNullable<ArgsType<T>["where"]>;
