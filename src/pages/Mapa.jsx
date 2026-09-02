import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useAutenticacao } from "../context/AuthContext.jsx";
import { api } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import PainelLista from "../components/PainelLista.jsx";
import ManipuladorClique from "../components/ManipuladorClique.jsx";
import ModalNovoAvistamento from "../components/ModalNovoAvistamento.jsx";
import { criarIconePegada } from "../components/iconePegada.js";
import "./Mapa.css";

const CENTRO_PADRAO = [-27.645, -48.67]; // Palhoça / Grande Florianópolis, SC

const RÓTULOS_STATUS = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  DESCARTADO: "Descartado",
};

function Voador({ alvo }) {
  const mapa = useMap();
  useEffect(() => {
    if (alvo) mapa.flyTo(alvo, 14, { duration: 1 });
  }, [alvo, mapa]);
  return null;
}

export default function Mapa() {
  const { usuario, token, autenticado } = useAutenticacao();

  const [avistamentos, setAvistamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState("");
  const [modoRegistro, setModoRegistro] = useState(false);
  const [coordenadasNovo, setCoordenadasNovo] = useState(null);
  const [alvoVoo, setAlvoVoo] = useState(null);
  const [painelAberto, setPainelAberto] = useState(true);
  const referenciasMarcadores = useRef({});

  async function carregarAvistamentos() {
    setCarregando(true);
    setErroCarga("");
    try {
      const dados = await api.listarAvistamentos(token);
      setAvistamentos(dados);
    } catch (erro) {
      setErroCarga(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (autenticado) carregarAvistamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  function aoClicarMapa(coordenadas) {
    setCoordenadasNovo(coordenadas);
    setModoRegistro(false);
  }

  async function salvarNovoAvistamento(dados) {
    const resposta = await api.criarAvistamento({ ...dados, usuarioId: usuario.id }, token);
    setAvistamentos((atual) => [resposta.avistamento, ...atual]);
    setCoordenadasNovo(null);
  }

  async function mudarStatus(id, status) {
    const resposta = await api.atualizarStatus(id, status, token);
    setAvistamentos((atual) => atual.map((a) => (a.id === id ? resposta.avistamento : a)));
  }

  async function removerAvistamento(id) {
    await api.removerAvistamento(id, token);
    setAvistamentos((atual) => atual.filter((a) => a.id !== id));
  }

  function selecionarNaLista(item) {
    setAlvoVoo([item.latitude, item.longitude]);
    setTimeout(() => referenciasMarcadores.current[item.id]?.openPopup(), 350);
  }

  return (
    <div className="pagina-mapa">
      <Navbar />

      <PainelLista
        avistamentos={avistamentos}
        carregando={carregando}
        aoSelecionar={selecionarNaLista}
        aberto={painelAberto}
        aoAlternar={() => setPainelAberto((a) => !a)}
      />

      {modoRegistro && (
        <div className="faixa-instrucao">Clique em um ponto do mapa para marcar o avistamento</div>
      )}

      {erroCarga && <div className="faixa-erro">{erroCarga}</div>}

      {!autenticado && (
        <div className="faixa-instrucao">
          Entre na sua conta para ver e registrar avistamentos no mapa.
        </div>
      )}

      {autenticado && (
        <button
          className={`botao botao-primario botao-flutuante ${modoRegistro ? "ativo" : ""}`}
          onClick={() => setModoRegistro((a) => !a)}
        >
          {modoRegistro ? "Cancelar" : "+ Novo avistamento"}
        </button>
      )}

      <MapContainer
        center={CENTRO_PADRAO}
        zoom={12}
        className={`mapa ${modoRegistro ? "modo-mira" : ""}`}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ManipuladorClique ativo={modoRegistro} aoClicar={aoClicarMapa} />
        <Voador alvo={alvoVoo} />

        {avistamentos.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={criarIconePegada(item.status)}
            ref={(referencia) => {
              if (referencia) referenciasMarcadores.current[item.id] = referencia;
            }}
          >
            <Popup>
              <div className="popup-avistamento">
                <div className="linha-titulo-item">
                  <strong>{item.titulo}</strong>
                  <span className={`selo selo-${item.status.toLowerCase()}`}>
                    {RÓTULOS_STATUS[item.status]}
                  </span>
                </div>
                <p className="popup-meta">
                  {item.criatura} · {new Date(item.dataAvistamento).toLocaleDateString("pt-BR")}
                </p>
                <p className="popup-descricao">{item.descricao}</p>
                <p className="popup-meta">📍 {item.localizacao}</p>
                <p className="popup-meta">Relatado por {item.usuario?.nome}</p>

                {(usuario?.role === "ADMIN" || usuario?.id === item.usuarioId) && (
                  <div className="popup-acoes">
                    <select
                      value={item.status}
                      onChange={(e) => mudarStatus(item.id, e.target.value)}
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="DESCARTADO">Descartado</option>
                    </select>
                    <button className="botao" onClick={() => removerAvistamento(item.id)}>
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {coordenadasNovo && (
        <ModalNovoAvistamento
          coordenadas={coordenadasNovo}
          aoSalvar={salvarNovoAvistamento}
          aoFechar={() => setCoordenadasNovo(null)}
        />
      )}
    </div>
  );
}
