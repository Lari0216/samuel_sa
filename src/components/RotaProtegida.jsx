import { Navigate } from "react-router-dom";
import { useAutenticacao } from "../context/AuthContext.jsx";

export default function RotaProtegida({ children }) {
  const { autenticado, carregando } = useAutenticacao();

  if (carregando) return null;
  if (!autenticado) return <Navigate to="/entrar" replace />;

  return children;
}
