# Little Ville — Frontend (Diário de Avistamentos)

Frontend em React + Vite para o backend de avistamentos de pé grande. Mostra os
avistamentos num mapa interativo (estilo Waze) usando Leaflet/OpenStreetMap —
não precisa de chave de API.

## Como rodar

Precisa de Node.js 18+ instalado.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Conectando com o backend

O endereço do backend fica em `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Já vem configurado para `http://localhost:3000`, que é a porta padrão do
backend. O front e o back estão conectados pelo (npm run dev) graças ao "concurrently".

## Observação importante sobre o backend

As rotas `GET /api/avistamentos` e `GET /api/avistamentos/:id` no `server.js`
estão protegidas pelo middleware `autenticar`. Isso significa que, do jeito
que o backend está agora, só quem tem login consegue ver os avistamentos no
mapa — o frontend foi feito respeitando essa regra (por isso a tela do mapa
exige login).

Se a ideia for qualquer visitante (sem conta) ver os avistamentos no mapa,
tipo o Waze, basta remover o `autenticar` dessas duas rotas de listagem no
`server.js`:

```js
servidor.get("/api/avistamentos", async (req, res) => { ... })
servidor.get("/api/avistamentos/:id", async (req, res) => { ... })
```

Mantendo `autenticar` em `POST`, `PUT`, `PATCH` e `DELETE`, só quem estiver
logado poderia criar/editar/remover avistamentos.

## Estrutura

```text
src/
  pages/       Mapa, Login, Registro
  components/  Navbar, painel lateral, modal de novo avistamento, ícone do mapa
  context/     AuthContext (sessão/JWT em localStorage)
  services/    api.js (chamadas para o backend)
  styles/      tema visual global
```
