import { z } from "zod";
 
export const userProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.email("El correo electrónico no es válido")
    .min(1, "El correo electrónico es requerido"),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .optional()
    .or(z.literal("")),
  role: z.string().optional(),
});
 
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
 
export const userProfileDefaultValues: UserProfileFormData = {
  name: "",
  email: "",
  phone: "",
  role: "Administrator",
};