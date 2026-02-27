import axios from 'axios'

export const BASE_URL = 'http://localhost:8000'
export const WS_URL = 'ws://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jarvis_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jarvis_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export async function login(username: string, password: string) {
  const { data } = await api.post('/auth/login', { username, password })
  return data as { access_token: string; token_type: string }
}

export async function sendChat(message: string, session_id?: string) {
  const { data } = await api.post('/assistant/chat', { message, session_id })
  return data as { reply: string; actions: { type: string; payload: unknown }[]; session_id: string }
}

export async function streamChat(message: string, session_id: string | undefined, onToken: (token: string) => void) {
  const token = localStorage.getItem('jarvis_token')
  const response = await fetch(`${BASE_URL}/assistant/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, session_id }),
  })
  if (!response.ok || !response.body) throw new Error('stream failed')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let done = false
  while (!done) {
    const { value, done: isDone } = await reader.read()
    done = isDone
    const chunk = decoder.decode(value || new Uint8Array(), { stream: true })
    chunk.split('\n\n').forEach((line) => {
      if (!line.startsWith('data: ')) return
      try {
        const evt = JSON.parse(line.slice(6))
        if (evt.type === 'token') onToken(evt.content)
      } catch {
        // ignore parse errors
      }
    })
  }
}

export async function fetchWeather(city = 'Recife') {
  const { data } = await api.get('/tools/weather', { params: { city } })
  return data
}

export async function fetchSystem() {
  const { data } = await api.get('/tools/system')
  return data
}

export async function ingestKnowledge(file: File) {
  const body = new FormData()
  body.append('upload', file)
  const { data } = await api.post('/knowledge/ingest', body)
  return data
}

export async function queryKnowledge(question: string) {
  const { data } = await api.post('/knowledge/query', { question, top_k: 5 })
  return data as { answer: string; citations: { document_id: number; chunk_id: number; chunk_index: number; snippet: string }[] }
}
