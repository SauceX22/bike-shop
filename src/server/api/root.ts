import { bikeRouter } from "@/server/api/routers/bike";
import { reservationRouter } from "@/server/api/routers/reservation";
import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bike: bikeRouter,
  user: userRouter,
  reservation: reservationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
