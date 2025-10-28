import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { messages } = req.body
  try {
    const kpath = path.join(process.cwd(), 'public', 'knowledge', 'pierre_sources.txt')
    let knowledge = ''
    if (fs.existsSync(kpath)) knowledge = fs.readFileSync(kpath, 'utf8')

    const userLatest = messages[messages.length-1].content
    const systemPrompt = `Você é um tutor especialista em Pierre de Maricourt (Petrus Peregrinus). Use SOMENTE as informações abaixo quando responder a perguntas factuais. Se não souber, diga claramente que não tem a informação. Forneça respostas claras, concisas e cite as fontes quando apropriado.\n\nCONTEÚDOBASE:\n${knowledge}\n\nUSUÁRIO: ${userLatest}`

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
      console.error('OpenAI error', err)
      return res.status(500).json({ error: 'Erro ao chamar LLM', detail: err })
    }

    const j = await resp.json()
    const text = j.choices?.[0]?.message?.content || 'Sem resposta.'
    return res.status(200).json({ text })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
}
