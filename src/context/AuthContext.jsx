import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem("little-ville-sessao");
    if (salvo) {
      const { usuario, token } = JSON.parse(salvo);
      setUsuario(usuario);
      setToken(token);
    }
    setCarregando(false);
  }, []);

  function salvarSessao(usuario, token) {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("little-ville-sessao", JSON.stringify({ usuario, token }));
  }

  async function entrar(email, senha) {
    const dados = await api.entrar(email, senha);
    salvarSessao(dados.usuario, dados.token);
  }

  async function registrar(nome, email, senha) {
    const dados = await api.registrar(nome, email, senha);
    salvarSessao(dados.usuario, dados.token);
  }

  function sair() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("little-ville-sessao");
  }

  return (
    <ContextoAutenticacao.Provider
      value={{ usuario, token, carregando, autenticado: Boolean(token), entrar, registrar, sair }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) throw new Error("useAutenticacao precisa estar dentro de ProvedorAutenticacao");
  return contexto;
}
