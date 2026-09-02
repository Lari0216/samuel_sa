import { Route, Routes } from "react-router-dom";
import Mapa from "./pages/Mapa.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <Mapa />
          </RotaProtegida>
        }
      />
    </Routes>
  );
}
