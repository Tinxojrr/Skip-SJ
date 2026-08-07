import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignUpForm } from "./components/SignUpForm";
import { type SignUpFormData } from "../../schemas";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
 
  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    console.log("sign up data:", data); // aca luego va Supabase
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
    navigate("/dashboard");
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3">
          Registrarse
        </h1>
        <p className="text-sm text-slate-600 mb-8">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/sign-in"
            className="text-blue-700 font-semibold underline underline-offset-2 hover:text-blue-800"
          >
            Inicia sesión
          </Link>
        </p>
 
        <SignUpForm onSubmit={handleSignUp} loading={loading} />
      </div>
    </div>
  );
};


