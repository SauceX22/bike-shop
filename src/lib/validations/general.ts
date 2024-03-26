import { z } from "zod";

export const addNewBikeSchema = z.object({
  name: z.string().min(3).max(25),
  model: z.string().min(3).max(25),
  color: z.string().min(3).max(25),
  location: z.string().min(3).max(25),
  available: z.boolean().default(true),
});

export const updateBikeSchema = addNewBikeSchema.partial();

export const ratingSchema = z.coerce.number().int().min(1).max(5);

export const filterFormSchema = z.object({
  query: z.string().default(""),
  queryType: z
    .enum(["all", "name", "model", "location", "ratingAvg"])
    .default("all"),
  // doa is a range of dates
  doa: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
});
