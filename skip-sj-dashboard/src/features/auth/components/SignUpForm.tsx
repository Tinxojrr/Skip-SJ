import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, signUpDefaultValues, type SignUpFormData } from "../../../schemas/index"; 

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  loading?: boolean;
}
 
export const SignUpForm = ({ onSubmit, loading }: SignUpFormProps) => {
  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  });
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
 
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">
            Nombre
          </label>
          <input
            id="name"
            placeholder="Ingresa tu nombre"
            {...register("name")}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-full
              text-slate-800 placeholder-slate-400 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition-all"
          />
          {errors.name && (
            <p className="text-xs text-red-500 pl-2">{errors.name.message}</p>
          )}
        </div>
 
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="Ingresa tu correo"
            {...register("email")}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-full
              text-slate-800 placeholder-slate-400 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition-all"
          />
          {errors.email && (
            <p className="text-xs text-red-500 pl-2">{errors.email.message}</p>
          )}
        </div>
 
        {/* Contraseña */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            {...register("password")}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-full
              text-slate-800 placeholder-slate-400 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition-all"
          />
          {errors.password && (
            <p className="text-xs text-red-500 pl-2">{errors.password.message}</p>
          )}
        </div>
 
        {/* Confirmar contraseña */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirma tu contraseña"
            {...register("confirmPassword")}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-full
              text-slate-800 placeholder-slate-400 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition-all"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 pl-2">{errors.confirmPassword.message}</p>
          )}
        </div>
 
        {/* Checkbox */}
        {/* <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
        </label> */}
 
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-linear-to-r from-amber-400 to-blue-700
            text-white text-sm font-bold rounded-full shadow-lg shadow-blue-700/20
            hover:shadow-xl hover:shadow-blue-700/30 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>
    </FormProvider>
  );
};