import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Você é um tutor sobre Pierre de Maricourt e magnetismo. Responda com clareza e cite as fontes quando apropriado.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  async function sendMessage(e) {
    e?.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/chat', { messages: [...messages, userMsg] })
      const botText = res.data.text
      setMessages(prev => [...prev, { role: 'assistant', content: botText }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao consultar a IA. Verifique a chave e o log do servidor.' }])
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(180deg,#efe7dd,#dccfb3)' }}>
          <header className="mb-4">
            <h1 className="text-2xl font-semibold" style={{ color: '#6b4c3b' }}>Professor Virtual — Pierre de Maricourt</h1>
            <p className="text-sm mt-1 text-gray-700">Chat por texto — pergunte algo sobre imãs, polos, história e experimentos.</p>
          </header>

          <div className="chat-card h-[60vh] overflow-auto p-4 mb-4">
            {messages.filter(m => m.role!=='system').map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={m.role==='user' ? 'user-bubble' : 'bot-bubble'}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Escreva sua pergunta sobre Pierre de Maricourt..." className="flex-1 p-3 rounded-lg" />
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg" style={{ background: '#6b4c3b', color: '#efe7dd' }}>{loading ? 'Enviando...' : 'Enviar'}</button>
          </form>

        </div>
      </div>
    </div>
  )
}
