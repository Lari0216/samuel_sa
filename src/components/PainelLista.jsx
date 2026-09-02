import "./PainelLista.css";

const RÓTULOS_STATUS = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  DESCARTADO: "Descartado",
};

export default function PainelLista({ avistamentos, carregando, aoSelecionar, aberto, aoAlternar }) {
  return (
    <aside className={`painel-lista ${aberto ? "aberto" : "fechado"}`}>
      <button className="alternar-painel" onClick={aoAlternar} aria-label="Mostrar ou esconder lista">
        {aberto ? "‹" : "›"}
      </button>

      <div className="conteudo-painel">
        <h2>Avistamentos recentes</h2>

        {carregando && <p className="painel-vazio">Carregando registros...</p>}

        {!carregando && avistamentos.length === 0 && (
          <p className="painel-vazio">Nenhum avistamento registrado ainda. Seja o primeiro a marcar um no mapa.</p>
        )}

        <ul className="lista-avistamentos">
          {avistamentos.map((item) => (
            <li key={item.id}>
              <button className="item-avistamento" onClick={() => aoSelecionar(item)}>
                <div className="linha-titulo-item">
                  <strong>{item.titulo}</strong>
                  <span className={`selo selo-${item.status.toLowerCase()}`}>
                    {RÓTULOS_STATUS[item.status]}
                  </span>
                </div>
                <p className="local-item">📍 {item.localizacao}</p>
                <p className="autor-item">por {item.usuario?.nome}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
