import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  protectedUserProcedure,
} from "@/server/api/trpc";

// startDate DateTime
// endDate   DateTime

// bikeId String
// reservedById String

export const reservationRouter = createTRPCRouter({
  createReservation: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        bikeId: z.string(),
        reservedById: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.reservation.create({
        data: {
          bike: { connect: { id: input.bikeId } },
          reservedBy: { connect: { id: input.reservedById } },
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
    }),
  getUserReservations: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.reservation.findMany({
      where: { reservedById: ctx.session.user.id },
    });
  }),
  getUserReservationsWithBikes: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.reservation.findMany({
      where: { reservedById: ctx.session.user.id },
      include: { bike: true },
    });
  }),
  rateBike: protectedUserProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.reservation.update({
        where: { id: input.id },
        data: { rating: input.rating },
      });
    }),
  cancelReservation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.reservation.delete({ where: { id: input.id } });
    }),
});
