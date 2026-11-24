import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Ingresa un correo válido").trim(),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
