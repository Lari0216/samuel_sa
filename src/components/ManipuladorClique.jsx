import { useMapEvents } from "react-leaflet";

export default function ManipuladorClique({ ativo, aoClicar }) {
  useMapEvents({
    click(evento) {
      if (!ativo) return;
      aoClicar(evento.latlng);
    },
  });

  return null;
}
