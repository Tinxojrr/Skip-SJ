import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("El correo electrónico no es válido")
    .min(1, "El correo electrónico es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signInDefaultValues: SignInFormData = {
  email: "",
  password: "",
};