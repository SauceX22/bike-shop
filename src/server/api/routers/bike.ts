import { z } from "zod";

import { addNewBikeSchema, updateBikeSchema } from "@/lib/validations/general";
import {
  createTRPCRouter,
  protectedManagerProcedure,
  protectedProcedure,
  protectedUserProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { areIntervalsOverlapping } from "date-fns";

export const bikeRouter = createTRPCRouter({
  createBike: protectedManagerProcedure
    .input(addNewBikeSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bike.create({
        data: {
          name: input.name,
          model: input.model,
          color: input.color,
          location: input.location,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getAllBikes: protectedManagerProcedure.query(async ({ ctx }) => {
    return await ctx.db.bike.findMany();
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
        include: {
          reservations: {
            include: { reservedBy: true },
          },
        },
      });
    }),
  reserveBike: protectedUserProcedure
    .input(
      z.object({
        id: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if the bike is available and not overlapping with other reservations
      const bike = await ctx.db.bike.findUnique({
        where: { id: input.id },
        include: { reservations: true },
      });

      if (!bike) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bike not found",
        });
      }

      if (!bike.available) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bike is not available at the moment, try again later.",
        });
      }

      for (const reservation of bike.reservations) {
        if (
          areIntervalsOverlapping(
            {
              start: reservation.startDate,
              end: reservation.endDate,
            },
            { start: input.startDate, end: input.endDate },
          )
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Bike is already reserved for all/part of the selected dates.",
          });
        }
      }

      return await ctx.db.reservation.create({
        data: {
          bike: { connect: { id: input.id } },
          reservedBy: { connect: { id: ctx.session.user.id } },
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
    }),
  updateBike: protectedManagerProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .and(updateBikeSchema),
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
