import { z } from "zod";

import {
  createTRPCRouter,
  protectedManagerProcedure,
  publicProcedure,
} from "@/server/api/trpc";

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
      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
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
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
    }),
  addManager: protectedManagerProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
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
