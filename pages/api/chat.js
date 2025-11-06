import fs from 'fs'
import path from 'path'

// força o modo dinâmico para que o Vercel leia as variáveis de ambiente corretamente
export const dynamic = 'force-dynamic'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages } = req.body

  // verificação extra para garantir que a variável foi carregada
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não encontrada no ambiente!')
    return res.status(500).json({ error: 'Chave da OpenAI não configurada no servidor.' })
  }

  try {
    const kpath = path.join(process.cwd(), 'public', 'knowledge', 'pierre_sources.txt')
    let knowledge = ''
    if (fs.existsSync(kpath)) knowledge = fs.readFileSync(kpath, 'utf8')

    const userLatest = messages[messages.length - 1].content

    const systemPrompt = `Você é um tutor especialista em Pierre de Maricourt (Petrus Peregrinus). 
Use SOMENTE as informações abaixo quando responder a perguntas factuais. 
Se não souber, diga claramente que não tem a informação. 
Forneça respostas claras, concisas e cite as fontes quando apropriado.

CONTEÚDO BASE:
${knowledge}

USUÁRIO: ${userLatest}`

    const resp = await fetch('https://api.openai.com/v1/chat/completi
