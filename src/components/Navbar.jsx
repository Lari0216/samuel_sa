import { Link, useNavigate } from "react-router-dom";
import { useAutenticacao } from "../context/AuthContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { usuario, autenticado, sair } = useAutenticacao();
  const navegar = useNavigate();

  function aoSair() {
    sair();
    navegar("/entrar");
  }

  return (
    <header className="barra-superior">
      <Link to="/" className="marca">
        <span className="marca-pegada">🦶</span>
        <span>
          Little Ville
          <small>Diário de Avistamentos</small>
        </span>
      </Link>

      <nav className="acoes-barra">
        {autenticado ? (
          <>
            <span className="saudacao">Olá, {usuario?.nome?.split(" ")[0]}</span>
            <button className="botao" onClick={aoSair}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/entrar" className="botao">
              Entrar
            </Link>
            <Link to="/registro" className="botao botao-primario">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
