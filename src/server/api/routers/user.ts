import bcrypt from "bcrypt";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedManagerProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        // check if the user has a password, if not, they have been created by the manager...
        // ...and should be able to register by simply setting their name and password
        const isManuallyCreated = !exists?.passwordHash;
        if (isManuallyCreated) {
          const hashedPassword = await bcrypt.hash(input.password, 10);
          return await ctx.db.user.update({
            where: { id: exists.id },
            data: {
              name: input.name,
              passwordHash: hashedPassword,
            },
          });
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      console.log("hashedPassword", hashedPassword);

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: hashedPassword,
        },
      });
    }),
  getAll: protectedManagerProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id,
        },
      },
    });
  }),
  getUser: protectedManagerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({ where: { id: input.id } });
    }),
  addUser: protectedManagerProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(UserRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
        },
      });
    }),
  updateUser: protectedManagerProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .and(
          z
            .object({
              name: z.string(),
              email: z.string().email(),
            })
            .partial(),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),
  deleteUser: protectedManagerProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.delete({ where: { id: input.id } });
    }),
});
