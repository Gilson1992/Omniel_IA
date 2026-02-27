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

// Auth
export async function login(username: string, password: string) {
  const { data } = await api.post('/auth/login', { username, password })
  return data as { access_token: string; token_type: string }
}

// Chat
export async function sendChat(message: string, session_id?: string) {
  const { data } = await api.post('/assistant/chat', { message, session_id })
  return data as { reply: string; actions: { type: string; payload: unknown }[]; session_id: string }
}

// Weather
export async function fetchWeather() {
  const { data } = await api.get('/tools/weather')
  return data
}

// System
export async function fetchSystem() {
  const { data } = await api.get('/tools/system')
  return data
}
