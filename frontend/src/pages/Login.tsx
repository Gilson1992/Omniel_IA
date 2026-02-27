import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      localStorage.setItem('jarvis_token', data.access_token)
      navigate('/dashboard')
    } catch {
      setError('ACCESS DENIED — Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        backgroundPosition: 'center center',
      }} />

      {/* Glow orb */}
      <div className="absolute" style={{
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-hud text-5xl font-black glow mb-2" style={{ color: 'var(--cyan)' }}>
            J.A.R.V.I.S
          </div>
          <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.3em' }}>
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </div>
          <div className="flex items-center gap-2 justify-center mt-3">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} className="animate-pulse" />
            <span className="font-mono-hud text-xs" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Card */}
        <div className="hud-card hud-corner p-8" style={{ borderRadius: 2 }}>
          <div className="font-hud text-xs mb-6" style={{ color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
            AUTHENTICATION REQUIRED
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono-hud text-xs block mb-1" style={{ color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
                OPERATOR ID
              </label>
              <input
                className="hud-input w-full px-3 py-2 text-sm"
                style={{ borderRadius: 1 }}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="font-mono-hud text-xs block mb-1" style={{ color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
                SECURITY KEY
              </label>
              <input
                className="hud-input w-full px-3 py-2 text-sm"
                style={{ borderRadius: 1 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="font-mono-hud text-xs py-2 px-3 animate-slide-up"
                style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 1 }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="hud-btn w-full py-3 mt-2 text-xs font-bold"
              style={{ borderRadius: 1 }}
            >
              {loading ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
              ) : (
                '▶ INITIATE ACCESS'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="font-mono-hud text-xs text-center" style={{ color: 'var(--text-dim)' }}>
              <span className="animate-blink">▌</span> SECURE CHANNEL ESTABLISHED
            </div>
          </div>
        </div>

        <div className="text-center mt-4 font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>
          JARVIS HUD v1.0.0 — STARK INDUSTRIES
        </div>
      </div>
    </div>
  )
}
