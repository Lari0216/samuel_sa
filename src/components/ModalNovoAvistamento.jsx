import { useState } from "react";
import "./ModalNovoAvistamento.css";

export default function ModalNovoAvistamento({ coordenadas, aoSalvar, aoFechar }) {
  const [titulo, setTitulo] = useState("");
  const [criatura, setCriatura] = useState("Pé Grande");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [dataAvistamento, setDataAvistamento] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await aoSalvar({
        titulo,
        criatura,
        descricao,
        localizacao,
        dataAvistamento: new Date(dataAvistamento).toISOString(),
        latitude: coordenadas.lat,
        longitude: coordenadas.lng,
      });
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
      setEnviando(false);
    }
  }

  return (
    <div className="fundo-modal" onClick={aoFechar}>
      <div className="cartao modal-avistamento" onClick={(e) => e.stopPropagation()}>
        <h2>Novo avistamento</h2>
        <p className="coordenadas-modal">
          📍 {coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)}
        </p>

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Vulto atravessou a trilha"
            />
          </div>

          <div className="campo">
            <label htmlFor="criatura">Criatura</label>
            <input
              id="criatura"
              required
              value={criatura}
              onChange={(e) => setCriatura(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="localizacao">Local (nome)</label>
            <input
              id="localizacao"
              required
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Ex: Trilha do Rio Negro"
            />
          </div>

          <div className="campo">
            <label htmlFor="data">Data e hora</label>
            <input
              id="data"
              type="datetime-local"
              required
              value={dataAvistamento}
              onChange={(e) => setDataAvistamento(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="descricao">O que você viu?</label>
            <textarea
              id="descricao"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o avistamento com o máximo de detalhes..."
            />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <div className="acoes-modal">
            <button type="button" className="botao" onClick={aoFechar}>
              Cancelar
            </button>
            <button className="botao botao-primario" disabled={enviando}>
              {enviando ? "Registrando..." : "Registrar avistamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
