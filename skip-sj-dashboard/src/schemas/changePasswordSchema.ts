import { z } from "zod";
 
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(6, "Debe tener al menos 6 caracteres"),
    confirmNewPassword: z.string().min(6, "Debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Las contraseñas no coinciden",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "La nueva contraseña debe ser distinta a la actual",
  });
 
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
 
export const changePasswordDefaultValues: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};