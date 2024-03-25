import { z } from "zod";

import {
  createTRPCRouter,
  protectedManagerProcedure,
  protectedProcedure,
  protectedUserProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// startDate DateTime
// endDate   DateTime

// bikeId String
// reservedById String

export const reservationRouter = createTRPCRouter({
  createReservation: protectedUserProcedure
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
  getReservationWithBike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.reservation.findUnique({
        where: { id: input.id },
        include: { bike: true, reservedBy: true },
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
      include: { bike: true, reservedBy: true },
    });
  }),
  getAllReservations: protectedManagerProcedure.query(async ({ ctx }) => {
    return await ctx.db.reservation.findMany({
      include: { bike: true, reservedBy: true },
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
      const bike = await ctx.db.bike.findFirst({
        where: { reservations: { some: { id: input.id } } },
        include: { reservations: true },
      });

      if (!bike) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bike not found",
        });
      }

      const oldAverageRatingForBike = bike?.averageRating;

      const newAverageRatingForBike =
        (oldAverageRatingForBike *
          bike.reservations.filter((r) => !!r.rating).length +
          input.rating) /
        (bike.reservations.filter((r) => !!r.rating).length + 1);

      return (
        await ctx.db.reservation.update({
          where: { id: input.id },
          data: {
            rating: input.rating,
            bike: {
              update: {
                averageRating: newAverageRatingForBike,
              },
            },
          },
        })
      ).rating;
    }),
  cancelReservation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.reservation.delete({ where: { id: input.id } });
    }),
});
