import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { SignInForm } from "./components/SignInForm";
import { type SignInFormData } from "../../schemas";
import { supabase } from "../../lib/supabase";

export const SignInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setError("");
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;
      
      // Si el login fue exitoso, el AuthContext automáticamente lo detectará
      // y actualizará el estado global. Redirigimos al dashboard.
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#0B2A6B] p-12 lg:p-24 flex-col justify-between relative text-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-24">
            <div className="grid h-14 w-14 place-items-center rounded bg-[#F5A623] text-sm font-black text-[#0B2A6B]">
              DUOC
            </div>
            <span className="font-bold tracking-wider text-lg opacity-90">DUOC UC</span>
          </div>

          <h2 className="text-5xl font-bold leading-tight tracking-tight mb-6">
            Skip Duoc UC <br /> <span className="text-[#F5A623] font-medium">Administración</span>
          </h2>
          <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
            Sistema de gestión interna para el control y administración de plataformas corporativas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-base text-blue-100/70">
          <ShieldCheck size={28} className="text-[#F5A623]" />
          <span>Acceso seguro para trabajadores de DUOC UC</span>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-7/12 lg:w-1/2 min-h-screen p-8 sm:p-14 lg:p-24 flex flex-col justify-center items-center">
        
        <div className="w-full max-w-[440px]">
          {/* Header with Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="grid h-14 w-14 place-items-center rounded bg-[#0B2A6B] text-sm font-black text-[#F5A623] mb-5">
              DUOC
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
              Panel Administrativo
            </h1>
            <p className="mt-3 text-base text-slate-600 text-center">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="mb-8 rounded bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <SignInForm onSubmit={handleSignIn} loading={loading} />

          {/* Footer */}
          <div className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-sm text-slate-500">
              Acceso restringido a personal autorizado. <br className="sm:hidden" />
              Skip Duoc UC v1.0
            </p>
          </div>
        </div>

      </div>
    </main>
  );
};
