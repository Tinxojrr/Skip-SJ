import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignInForm } from "./components/SignInForm";
import  {type SignInFormData } from "../../schemas";
 
const TEST_EMAIL = "admin@skipsj.cl";
const TEST_PASSWORD = "123456";
 
export const SignInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setError("");
 
    await new Promise((resolve) => setTimeout(resolve, 300));
 
    if (data.email === TEST_EMAIL && data.password === TEST_PASSWORD) {
      navigate("/dashboard"); // deberia navegar a la pagina de login no directamente a dashboard, pero por ahora lo hacemos asi para testear
    } else {
      setError("Credenciales incorrectas");
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-600 mb-8">
          ¿No tienes cuenta?{" "}
          <Link
            to="/sign-up"
            className="text-blue-700 font-semibold underline underline-offset-2 hover:text-blue-800"
          >
            Regístrarse
          </Link>
        </p>
 
        {error && (
          <p className="text-sm text-red-500 mb-4 pl-2">{error}</p>
        )}
 
        <SignInForm onSubmit={handleSignIn} loading={loading} />
      </div>
    </div>
  );
};