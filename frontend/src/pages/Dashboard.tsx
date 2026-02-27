import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { WS_URL, fetchWeather, fetchSystem } from '../lib/api'
import Radar from '../components/Radar'
import { SystemCard, WeatherCard, CameraCard, UptimeCard } from '../components/HUDCards'
import Transcript from '../components/Transcript'

interface WSEvent {
  type: string
  timestamp: number
  data: { transcript: string; status: string; cpu: number; ram: number }
}

interface SystemData { cpu_percent: number; ram_percent: number; uptime_seconds: number }
interface WeatherData { location: string; temperature: number; condition: string; humidity: number; wind_speed: number; icon: string }

const BUTTONS = ['SCAN', 'LOCK', 'FIRE', 'COMM', 'NAV', 'SYS']

export default function Dashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('INITIALIZING')
  const [liveTranscript, setLiveTranscript] = useState('Connecting to JARVIS core...')
  const [systemData, setSystemData] = useState<SystemData>({ cpu_percent: 0, ram_percent: 0, uptime_seconds: 0 })
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [time, setTime] = useState(new Date())
  const [activeBtn, setActiveBtn] = useState<string | null>(null)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // WebSocket
  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    if (!token) { navigate('/login'); return }

    let ws: WebSocket
    let retryTimeout: ReturnType<typeof setTimeout>

    function connect() {
      ws = new WebSocket(`${WS_URL}/assistant/events?token=${encodeURIComponent(token as string)}`)

      ws.onopen = () => {
        setWsConnected(true)
        setStatus('ONLINE')
      }

      ws.onmessage = (e) => {
        try {
          const evt: WSEvent = JSON.parse(e.data)
          setLiveTranscript(evt.data.transcript)
          setStatus(evt.data.status)
          setSystemData(prev => ({
            ...prev,
            cpu_percent: evt.data.cpu,
            ram_percent: evt.data.ram,
          }))
        } catch {}
      }

      ws.onclose = () => {
        setWsConnected(false)
        setStatus('RECONNECTING')
        retryTimeout = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      clearTimeout(retryTimeout)
      ws?.close()
    }
  }, [navigate])

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const [sys, weather] = await Promise.all([fetchSystem(), fetchWeather()])
        setSystemData(sys)
        setWeatherData(weather)
      } catch {}
    }
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  // Uptime counter
  useEffect(() => {
    const t = setInterval(() => {
      setSystemData(prev => ({ ...prev, uptime_seconds: prev.uptime_seconds + 1 }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  function logout() {
    localStorage.removeItem('jarvis_token')
    navigate('/login')
  }

  const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false })
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', height: '100vh', overflow: 'hidden' }}>
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,10,20,0.9)' }}>
        <div className="flex items-center gap-4">
          <div className="font-hud font-black text-lg glow" style={{ color: 'var(--cyan)', letterSpacing: '0.3em' }}>
            J.A.R.V.I.S
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? '#4cff91' : '#ff6b6b', boxShadow: `0 0 6px ${wsConnected ? '#4cff91' : '#ff6b6b'}` }} className="animate-pulse" />
            <span className="font-mono-hud text-xs" style={{ color: wsConnected ? '#4cff91' : '#ff6b6b', letterSpacing: '0.1em' }}>
              {wsConnected ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Mini stats */}
          {[
            { label: 'CPU', value: `${systemData.cpu_percent.toFixed(0)}%` },
            { label: 'RAM', value: `${systemData.ram_percent.toFixed(0)}%` },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>{s.label}</span>
              <span className="font-mono-hud text-xs" style={{ color: 'var(--cyan)' }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-hud text-sm font-bold glow-sm" style={{ color: 'var(--cyan)' }}>{fmtTime(time)}</div>
            <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 9 }}>{fmtDate(time)}</div>
          </div>
          <button onClick={logout} className="hud-btn px-3 py-1 text-xs" style={{ borderRadius: 1 }}>
            ⏏ EXIT
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 gap-3 p-3" style={{ minHeight: 0 }}>
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-3" style={{ width: 220, flexShrink: 0 }}>
          <SystemCard cpu={systemData.cpu_percent} ram={systemData.ram_percent} uptime={systemData.uptime_seconds} />
          <WeatherCard data={weatherData} />
          <CameraCard />
          <UptimeCard uptime={systemData.uptime_seconds} />
        </div>

        {/* CENTER */}
        <div className="flex flex-col flex-1 gap-3" style={{ minWidth: 0 }}>
          {/* Radar area */}
          <div className="hud-card hud-corner flex-1 flex flex-col items-center justify-center" style={{ borderRadius: 2, position: 'relative' }}>
            {/* Corner labels */}
            <div className="absolute top-2 left-3 font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 9 }}>TACTICAL DISPLAY</div>
            <div className="absolute top-2 right-3 font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 9 }}>THREAT LEVEL: LOW</div>

            <Radar status={status} />

            {/* Bottom metrics */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4">
              {[
                { label: 'TARGETS', value: '4' },
                { label: 'ALLIES', value: '1' },
                { label: 'THREATS', value: '0' },
                { label: 'SIGNAL', value: '98%' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className="font-hud text-base font-bold glow" style={{ color: 'var(--cyan)' }}>{m.value}</div>
                  <div className="font-mono-hud" style={{ color: 'var(--text-dim)', fontSize: 8, letterSpacing: '0.1em' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="hud-card p-3 flex items-center justify-center gap-4" style={{ borderRadius: 2 }}>
            {BUTTONS.map(btn => (
              <button
                key={btn}
                onClick={() => setActiveBtn(activeBtn === btn ? null : btn)}
                className="flex flex-col items-center gap-1 group"
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  border: `1px solid ${activeBtn === btn ? 'var(--cyan)' : 'var(--border)'}`,
                  background: activeBtn === btn ? 'rgba(0,212,255,0.2)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: activeBtn === btn ? '0 0 12px var(--cyan-glow)' : 'none',
                  transition: 'all 0.2s',
                }}
                  className="group-hover:border-cyan-400 group-hover:bg-cyan-400/10"
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: activeBtn === btn ? 'var(--cyan)' : 'var(--border)',
                    boxShadow: activeBtn === btn ? '0 0 6px var(--cyan)' : 'none',
                    transition: 'all 0.2s',
                  }} />
                </div>
                <span className="font-hud" style={{ color: activeBtn === btn ? 'var(--cyan)' : 'var(--text-dim)', fontSize: 8, letterSpacing: '0.15em' }}>{btn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - TRANSCRIPT/CHAT */}
        <div className="flex flex-col" style={{ width: 300, flexShrink: 0 }}>
          <div className="hud-card hud-corner flex-1 p-4 flex flex-col" style={{ borderRadius: 2, minHeight: 0 }}>
            <div className="font-hud text-xs mb-3" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>
              COMM INTERFACE
            </div>
            <div className="flex-1" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <Transcript liveTranscript={liveTranscript} status={status} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="hud-card mt-3 p-3 grid grid-cols-2 gap-2" style={{ borderRadius: 2 }}>
            {['WEATHER', 'SYSTEM', 'SCAN AREA', 'PROTOCOLS'].map(action => (
              <button key={action} className="hud-btn py-1.5 px-2 text-xs" style={{ borderRadius: 1, fontSize: 9 }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
