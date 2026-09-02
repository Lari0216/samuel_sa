import L from "leaflet";

const CORES_POR_STATUS = {
  PENDENTE: "#e0982f",
  CONFIRMADO: "#6fa37a",
  DESCARTADO: "#b5533c",
};

export function criarIconePegada(status = "PENDENTE") {
  const cor = CORES_POR_STATUS[status] || CORES_POR_STATUS.PENDENTE;

  return L.divIcon({
    className: "icone-pegada",
    html: `
      <svg width="30" height="30" viewBox="0 0 64 64" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.55))">
        <ellipse cx="32" cy="40" rx="14" ry="18" fill="${cor}" stroke="#0e1a13" stroke-width="2"/>
        <circle cx="20" cy="16" r="5" fill="${cor}" stroke="#0e1a13" stroke-width="2"/>
        <circle cx="32" cy="10" r="5.5" fill="${cor}" stroke="#0e1a13" stroke-width="2"/>
        <circle cx="44" cy="16" r="5" fill="${cor}" stroke="#0e1a13" stroke-width="2"/>
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 26],
    popupAnchor: [0, -22],
  });
}
