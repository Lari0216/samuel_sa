# 🐾 Little Ville — Frontend

Frontend em **React + Vite** para o sistema de **Diário de Avistamentos de Pé Grande**.

O projeto permite visualizar e registrar avistamentos através de um **mapa interativo**, utilizando **Leaflet + OpenStreetMap**, sem necessidade de chave de API.

---

## 🚀 Funcionalidades

### 👤 Usuários

* Cadastro de usuários com nome, e-mail e senha.
* Login com autenticação via JWT.
* Senhas armazenadas utilizando bcrypt.
* Controle de acesso por tipo de usuário:

  * `MORADOR`
  * `ADMIN`
* Logout e manutenção da sessão através do `localStorage`.

### 🐾 Avistamentos

* Cadastro de avistamentos com:

  * Título
  * Descrição
  * Criatura
  * Data e hora
  * Localização
  * Latitude e longitude
* Consulta, edição e remoção de avistamentos.
* Cada avistamento pertence ao usuário que o registrou.
* Status disponíveis:

  * 🟡 `PENDENTE`
  * 🟢 `CONFIRMADO`
  * 🔴 `DESCARTADO`
* Avistamentos exibidos do mais recente para o mais antigo.

### 🗺️ Mapa

* Mapa interativo utilizando **Leaflet + OpenStreetMap**.
* Visualização dos avistamentos através de marcadores.
* Marcadores diferenciados por cor conforme o status.
* Visualização dos detalhes de cada avistamento.
* Registro de novos avistamentos diretamente pelo mapa.
* Lista lateral com os avistamentos recentes.
* O autor do registro ou um administrador pode alterar o status ou remover o avistamento.

---

## 🛠️ Tecnologias

### Frontend

* React
* Vite
* Leaflet
* OpenStreetMap
* JavaScript
* CSS

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt

---

## ⚙️ Como rodar

É necessário ter o **Node.js 18+** instalado.

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

O frontend estará disponível em:

```text
http://localhost:5173
```

---

## 🔗 Conectando com o Backend

O endereço do backend é configurado através do arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

O endereço padrão é `http://localhost:3000`, que corresponde à porta utilizada pelo backend.

O frontend e o backend podem ser executados juntos através do:

```bash
npm run dev
```

utilizando o **concurrently** para iniciar os serviços.

---

## 🔐 Autenticação e acesso aos avistamentos

As rotas:

```text
GET /api/avistamentos
GET /api/avistamentos/:id
```

estão protegidas pelo middleware `autenticar` no backend.

Por isso, atualmente, **somente usuários autenticados conseguem visualizar os avistamentos no mapa**. O frontend segue essa regra e exige login para acessar a tela do mapa.

Caso o projeto queira permitir que qualquer visitante visualize os avistamentos, as duas rotas podem deixar de utilizar o middleware `autenticar`:

```js
servidor.get("/api/avistamentos", async (req, res) => { ... })

servidor.get("/api/avistamentos/:id", async (req, res) => { ... })
```

Nesse caso, o middleware `autenticar` pode continuar sendo utilizado nas operações de:

```text
POST
PUT
PATCH
DELETE
```

Assim, visitantes poderiam **visualizar** os avistamentos, enquanto somente usuários autenticados poderiam **criar, editar ou remover** registros.

---

## 📁 Estrutura do Frontend

```text
src/
├── pages/
│   ├── Mapa
│   ├── Login
│   └── Registro
│
├── components/
│   ├── Navbar
│   ├── Painel lateral
│   ├── Modal de novo avistamento
│   └── Ícone do mapa
│
├── context/
│   └── AuthContext
│       └── Sessão e JWT no localStorage
│
├── services/
│   └── api.js
│       └── Chamadas para o backend
│
└── styles/
    └── Tema visual global
```

---

## 🔒 Segurança

* Autenticação utilizando **JWT**.
* Senhas armazenadas com **bcrypt**.
* Rotas protegidas por `Authorization: Bearer`.
* Senhas não são retornadas pela API.
* Configurações sensíveis utilizam variáveis de ambiente.
* Token de autenticação possui validade de 7 dias.

---

## 📋 Regras de negócio

* O e-mail de cada usuário deve ser único.
* Todo usuário possui um `role`: `MORADOR` ou `ADMIN`.
* Todo avistamento pertence a um único usuário.
* Ao excluir um usuário, seus avistamentos também são removidos.
* Novos avistamentos possuem status `PENDENTE` por padrão.
* O status só pode ser `PENDENTE`, `CONFIRMADO` ou `DESCARTADO`.
* Latitude e longitude são obrigatórias para registrar um avistamento.
* O token expira após 7 dias.
* Apenas o autor do avistamento ou um administrador pode alterar seu status ou removê-lo.

---

## 🎯 Objetivo

O **Little Ville** foi desenvolvido para criar uma plataforma de registro e acompanhamento de avistamentos de Pé Grande, combinando **React, API REST, autenticação, banco de dados e mapas interativos**.

O projeto busca proporcionar uma experiência semelhante a aplicativos de mapas, permitindo que os usuários visualizem e registrem ocorrências de forma simples e visual.
