import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signInDefaultValues, type SignInFormData } from "../../../schemas";
 
interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
  loading?: boolean;
}
 
export const SignInForm = ({ onSubmit, loading }: SignInFormProps) => {
  const methods = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  });
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
 
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
 
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-linear-to-r from-amber-400 to-blue-700
            text-white text-sm font-bold rounded-full shadow-lg shadow-blue-700/20
            hover:shadow-xl hover:shadow-blue-700/30 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </FormProvider>
  );
};