import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticacao } from "../context/AuthContext.jsx";
import "./Autenticacao.css";

export default function Registro() {
  const { registrar } = useAutenticacao();
  const navegar = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await registrar(nome, email, senha);
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
        <h1>Criar conta</h1>
        <p className="subtitulo">Cadastre-se para começar a registrar avistamentos.</p>

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

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
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
            />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button className="botao botao-primario" disabled={enviando}>
            {enviando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="rodape-autenticacao">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
