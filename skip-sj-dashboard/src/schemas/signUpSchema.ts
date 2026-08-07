import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.email("El correo electrónico no es válido")
    .min(1, "El correo electrónico es requerido"),
  password: z.string().min(6, "Debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signUpDefaultValues: SignUpFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
