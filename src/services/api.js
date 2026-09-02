const URL_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function requisitar(caminho, { metodo = "GET", corpo, token } = {}) {
  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem = dados?.message || "Não foi possível completar a solicitação";
    throw new Error(mensagem);
  }

  return dados;
}

export const api = {
  registrar: (nome, email, senha) =>
    requisitar("/api/usuarios/registro", { metodo: "POST", corpo: { nome, email, senha } }),

  entrar: (email, senha) =>
    requisitar("/api/usuarios/entrar", { metodo: "POST", corpo: { email, senha } }),

  listarAvistamentos: (token) => requisitar("/api/avistamentos", { token }),

  buscarAvistamento: (id) => requisitar(`/api/avistamentos/${id}`),

  criarAvistamento: (dados, token) =>
    requisitar("/api/avistamentos", { metodo: "POST", corpo: dados, token }),

  atualizarStatus: (id, status, token) =>
    requisitar(`/api/avistamentos/${id}/status`, { metodo: "PATCH", corpo: { status }, token }),

  removerAvistamento: (id, token) =>
    requisitar(`/api/avistamentos/${id}`, { metodo: "DELETE", token }),
};
