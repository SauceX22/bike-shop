import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bikeRouter = createTRPCRouter({
  getBikeById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.bike.findFirst({
        where: {
          id: input.id,
        },
      });
    }),
});
