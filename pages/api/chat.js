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

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userLatest }
        ],
        max_tokens: 800
      })
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('❌ Erro da OpenAI:', err)
      return res.status(500).json({ error: 'Erro ao chamar o modelo da OpenAI', detail: err })
    }

    const j = await resp.json()
    const text = j.choices?.[0]?.message?.content || 'Sem resposta.'
    return res.status(200).json({ text })

  } catch (err) {
    console.error('❌ Erro no servidor:', err)
    res.status(500).json({ error: String(err) })
  }
}
