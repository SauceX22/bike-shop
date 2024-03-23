import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userAuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const userAuthRegisterSchema = userAuthLoginSchema.extend({
  name: z.string().min(3).max(25),
});

export const addNewUserSchema = userAuthRegisterSchema
  .pick({
    name: true,
    email: true,
  })
  .extend({
    role: z.nativeEnum(UserRole),
    enabled: z.boolean().default(true),
  });
