import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 3 character long"),
  email: z.string().email("Invalid Email Format"),
  password: z.string().min(8, "Password must be at least 8 character long"),
});
export const LoginSchema = z.object({
   email: z.string().email("Invalid Email Format"),
  password: z.string().min(8, "Password must be at least 8 character long"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginSchema = z.infer<typeof RegisterSchema>;
