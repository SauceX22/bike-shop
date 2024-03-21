import { z } from "zod";

export const addNewBikeSchema = z.object({
  name: z.string().min(3).max(25),
  model: z.string().min(3).max(25),
  color: z.string().min(3).max(25),
  location: z.string().min(3).max(25),
  available: z.boolean().default(true),
});
