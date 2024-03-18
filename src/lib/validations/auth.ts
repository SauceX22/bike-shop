import { z } from "zod";

export const userAuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const userAuthRegisterSchema = z.object({
  name: z.string().min(3).max(25),
  email: z.string().email(),
  password: z.string().min(8),
});
