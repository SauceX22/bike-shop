import { z } from "zod";

import {
  createTRPCRouter,
  protectedManagerProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const bikeRouter = createTRPCRouter({
  createBike: protectedManagerProcedure
    .input(
      z.object({
        name: z.string(),
        model: z.string(),
        color: z.string(),
        location: z.string(),
        available: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bike.create({
        data: {
          name: input.name,
          model: input.model,
          color: input.color,
          location: input.location,
        },
      });
    }),
  getAvailableBikes: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.bike.findMany({
      where: { available: true },
    });
  }),
  getBike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bike.findUnique({ where: { id: input.id } });
    }),
  getBikeWithReservations: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bike.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "query",
        include: { reservations: true },
      });
    }),
  updateBike: protectedManagerProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .and(
          z
            .object({
              name: z.string(),
              model: z.string(),
              color: z.string(),
              location: z.string(),
              available: z.boolean(),
            })
            .partial(),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bike.update({
        where: { id: input.id },
        data: {
          name: input.name,
          model: input.model,
          color: input.color,
          location: input.location,
          available: input.available,
        },
      });
    }),
  deleteBike: protectedManagerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bike.delete({ where: { id: input.id } });
    }),
});
