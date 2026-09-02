import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticacao } from "../context/AuthContext.jsx";
import "./Autenticacao.css";

export default function Login() {
  const { entrar } = useAutenticacao();
  const navegar = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(email, senha);
      navegar("/");
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-autenticacao">
      <div className="cartao cartao-autenticacao">
        <h1>Bem-vindo de volta</h1>
        <p className="subtitulo">Entre para registrar e ver os avistamentos no mapa.</p>

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button className="botao botao-primario" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="rodape-autenticacao">
          Ainda não tem conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
