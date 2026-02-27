import { useEffect, useRef, useState } from 'react'
import { sendChat } from '../lib/api'

interface Message {
  role: 'user' | 'jarvis'
  text: string
  time: string
}

interface TranscriptProps {
  liveTranscript: string
  status: string
}

export default function Transcript({ liveTranscript, status }: TranscriptProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'jarvis', text: 'All systems online. How can I assist you today?', time: '00:00' }
  ])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const now = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg, time: now() }])
    setLoading(true)
    try {
      const res = await sendChat(msg, sessionId)
      setSessionId(res.session_id)
      setMessages(prev => [...prev, { role: 'jarvis', text: res.reply, time: now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'jarvis', text: 'Communication error. Retrying...', time: now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Live status bar */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4cff91', boxShadow: '0 0 6px #4cff91' }} className="animate-pulse" />
          <span className="font-hud text-xs" style={{ color: 'var(--cyan)', letterSpacing: '0.15em' }}>{status}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 9 }}>
          ◈ {liveTranscript}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 animate-slide-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="flex-shrink-0 font-hud text-xs flex items-center justify-center"
              style={{
                width: 28, height: 28, border: '1px solid',
                borderColor: m.role === 'jarvis' ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
                background: m.role === 'jarvis' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)',
                color: m.role === 'jarvis' ? 'var(--cyan)' : 'rgba(255,255,255,0.5)',
                fontSize: 9, borderRadius: 1, flexShrink: 0,
              }}>
              {m.role === 'jarvis' ? 'AI' : 'OP'}
            </div>
            <div style={{ maxWidth: '75%' }}>
              <div className="font-mono-hud px-3 py-2 text-xs"
                style={{
                  background: m.role === 'jarvis' ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${m.role === 'jarvis' ? 'var(--border)' : 'rgba(255,255,255,0.08)'}`,
                  color: m.role === 'jarvis' ? 'var(--text)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 1,
                  lineHeight: 1.6,
                }}>
                {m.text}
              </div>
              <div className="font-mono-hud mt-0.5 px-1" style={{ color: 'var(--text-dim)', fontSize: 8 }}>{m.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="font-hud text-xs flex items-center justify-center"
              style={{ width: 28, height: 28, border: '1px solid var(--cyan)', background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', fontSize: 9, borderRadius: 1 }}>
              AI
            </div>
            <div className="font-mono-hud px-3 py-2 text-xs animate-pulse"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: 1 }}>
              Processing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          className="hud-input flex-1 px-3 py-2 text-xs"
          style={{ borderRadius: 1 }}
          placeholder="ENTER COMMAND..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="hud-btn px-4 py-2 font-bold"
          style={{ borderRadius: 1, minWidth: 60 }}
        >
          ▶
        </button>
      </div>
    </div>
  )
}
