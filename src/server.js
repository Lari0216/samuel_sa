import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "./lib/prisma.ts"

const servidor = express()
const porta = Number(process.env.PORT) || 3000
const segredoJwt = process.env.JWT_SECRET || "little-ville-secret"

servidor.use(cors({ origin: "https://little-ville.onrender.com/entrar" }))
servidor.use(express.json())

const formatarUsuario = (usuario) => {
  if (!usuario) return null

  const { senha, ...usuarioSeguro } = usuario
  return usuarioSeguro
}

const gerarToken = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    },
    segredoJwt,
    { expiresIn: "7d" }
  )

const autenticar = async (req, res, next) => {
  try {
    const cabecalho = req.headers.authorization

    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token de autenticação ausente ou inválido" })
    }

    const token = cabecalho.replace("Bearer ", "")
    const payload = jwt.verify(token, segredoJwt)

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(payload.id) },
    })

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não autorizado" })
    }

    req.usuario = usuario
    next()
  } catch (error) {
    return res.status(401).json({ message: "Sessão inválida ou expirada" })
  }
}

servidor.get("/saude", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" })
})

servidor.post("/api/usuarios/registro", async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "nome, email e senha são obrigatórios" })
    }

    const emailFormatado = String(email).trim().toLowerCase()

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
    })

    if (usuarioExistente) {
      return res.status(409).json({ message: "Este e-mail já está cadastrado" })
    }

    const senhaHash = await bcrypt.hash(String(senha), 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome: String(nome).trim(),
        email: emailFormatado,
        senha: senhaHash,
        role: role === "ADMIN" ? "ADMIN" : "MORADOR",
      },
    })

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      usuario: formatarUsuario(usuario),
      token: gerarToken(usuario),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao cadastrar usuário", error: error.message })
  }
})

servidor.post("/api/usuarios/entrar", async (req, res) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: "email e senha são obrigatórios" })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    })

    if (!usuario) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    return res.json({
      message: "Login realizado com sucesso",
      usuario: formatarUsuario(usuario),
      token: gerarToken(usuario),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao fazer login", error: error.message })
  }
})

servidor.get("/api/usuarios", autenticar, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        avistamentos: true,
      },
    })

    return res.json(usuarios.map(formatarUsuario))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao listar usuários", error: error.message })
  }
})

servidor.get("/api/usuarios/:id", autenticar, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      include: { avistamentos: true },
    })

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    return res.json(formatarUsuario(usuario))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao buscar usuário", error: error.message })
  }
})

servidor.put("/api/usuarios/:id", autenticar, async (req, res) => {
  try {
    const { nome, email, role } = req.body
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
    })

    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: {
        nome: nome ? String(nome).trim() : undefined,
        email: email ? String(email).trim().toLowerCase() : undefined,
        role: role === "ADMIN" ? "ADMIN" : role === "MORADOR" ? "MORADOR" : undefined,
      },
      include: { avistamentos: true },
    })

    return res.json({
      message: "Usuário atualizado com sucesso",
      usuario: formatarUsuario(usuarioAtualizado),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message })
  }
})

servidor.delete("/api/usuarios/:id", autenticar, async (req, res) => {
  try {
    const usuarioId = Number(req.params.id)
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    await prisma.avistamento.deleteMany({ where: { usuarioId } })
    await prisma.usuario.delete({ where: { id: usuarioId } })

    return res.json({ message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao remover usuário", error: error.message })
  }
})

servidor.get("/api/avistamentos", autenticar, async (req, res) => {
  try {
    const avistamentos = await prisma.avistamento.findMany({
      orderBy: { dataAvistamento: "desc" },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return res.json(avistamentos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao listar avistamentos", error: error.message })
  }
})

servidor.get("/api/avistamentos/:id", autenticar, async (req, res) => {
  try {
    const avistamento = await prisma.avistamento.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!avistamento) {
      return res.status(404).json({ message: "Avistamento não encontrado" })
    }

    return res.json(avistamento)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao buscar avistamento", error: error.message })
  }
})

servidor.post("/api/avistamentos", autenticar, async (req, res) => {
  try {
    const { titulo, descricao, criatura, dataAvistamento, localizacao, usuarioId, status, latitude, longitude } = req.body

    if (!titulo || !descricao || !criatura || !dataAvistamento || !localizacao || !usuarioId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" })
    }
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } })

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado para este avistamento" })
    }

    const avistamento = await prisma.avistamento.create({
      data: {
        titulo: String(titulo).trim(),
        descricao: String(descricao).trim(),
        criatura: String(criatura).trim(),
        dataAvistamento: new Date(dataAvistamento),
        localizacao: String(localizacao).trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: status === "CONFIRMADO" || status === "DESCARTADO" ? status : "PENDENTE",
        usuarioId: Number(usuarioId),
      },
      
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return res.status(201).json({
      message: "Avistamento criado com sucesso",
      avistamento,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao criar avistamento", error: error.message })
  }
})

servidor.put("/api/avistamentos/:id", autenticar, async (req, res) => {
  try {
    const avistamentoExistente = await prisma.avistamento.findUnique({
      where: { id: Number(req.params.id) },
    })

    if (!avistamentoExistente) {
      return res.status(404).json({ message: "Avistamento não encontrado" })
    }

    const { titulo, descricao, criatura, dataAvistamento, localizacao, status } = req.body

    const avistamentoAtualizado = await prisma.avistamento.update({
      where: { id: Number(req.params.id) },
      data: {
        titulo: titulo ? String(titulo).trim() : undefined,
        descricao: descricao ? String(descricao).trim() : undefined,
        criatura: criatura ? String(criatura).trim() : undefined,
        dataAvistamento: dataAvistamento ? new Date(dataAvistamento) : undefined,
        localizacao: localizacao ? String(localizacao).trim() : undefined,
        status: status === "CONFIRMADO" || status === "DESCARTADO" || status === "PENDENTE" ? status : undefined,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return res.json({
      message: "Avistamento atualizado com sucesso",
      avistamento: avistamentoAtualizado,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao atualizar avistamento", error: error.message })
  }
})

servidor.patch("/api/avistamentos/:id/status", autenticar, async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !["PENDENTE", "CONFIRMADO", "DESCARTADO"].includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use: PENDENTE, CONFIRMADO ou DESCARTADO" })
    }

    const avistamento = await prisma.avistamento.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return res.json({ message: "Status do avistamento atualizado", avistamento })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao atualizar status", error: error.message })
  }
})

servidor.delete("/api/avistamentos/:id", autenticar, async (req, res) => {
  try {
    const avistamento = await prisma.avistamento.findUnique({
      where: { id: Number(req.params.id) },
    })

    if (!avistamento) {
      return res.status(404).json({ message: "Avistamento não encontrado" })
    }

    await prisma.avistamento.delete({
      where: { id: Number(req.params.id) },
    })

    return res.json({ message: "Avistamento removido com sucesso" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao remover avistamento", error: error.message })
  }
})

servidor.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ message: "Erro interno do servidor", error: error.message })
})

servidor.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})

export default servidor
