import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signInSchema, signInDefaultValues, type SignInFormData } from "../../../schemas";

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
  loading?: boolean;
}

export const SignInForm = ({ onSubmit, loading }: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  });
  const { register, handleSubmit, formState: { errors } } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Correo institucional</label>
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              id="email" 
              type="email" 
              autoComplete="email" 
              placeholder="nombre@duocuc.cl" 
              aria-invalid={Boolean(errors.email)} 
              {...register("email")} 
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500" 
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
          <div className="relative">
            <LockKeyhole size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              autoComplete="current-password" 
              placeholder="Ingresa tu contraseña" 
              aria-invalid={Boolean(errors.password)} 
              {...register("password")} 
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword((visible) => !visible)} 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" 
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              {...register("rememberMe")} 
              className="h-4 w-4 rounded border-slate-300 text-[#0B2A6B] focus:ring-[#F5A623]" 
            />
            <span className="text-sm text-slate-600">Recordarme</span>
          </label>
          <button type="button" className="text-sm font-medium text-[#0B2A6B] hover:underline focus:outline-none focus:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full rounded-md bg-[#0B2A6B] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#081e4d] focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Verificando..." : "Ingresar al panel"}
        </button>
      </form>
    </FormProvider>
  );
};
