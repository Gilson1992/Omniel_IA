interface SystemCardProps {
  cpu: number
  ram: number
  uptime: number
}

export function SystemCard({ cpu, ram, uptime }: SystemCardProps) {
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="hud-card hud-corner p-4 space-y-3" style={{ borderRadius: 2 }}>
      <div className="font-hud text-xs" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>SYS MONITOR</div>
      <StatBar label="CPU" value={cpu} color={cpu > 70 ? '#ff6b6b' : 'var(--cyan)'} />
      <StatBar label="RAM" value={ram} color="var(--cyan)" />
      <div className="flex justify-between items-center pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>UPTIME</span>
        <span className="font-mono-hud text-xs glow-sm" style={{ color: 'var(--cyan)' }}>{fmt(uptime)}</span>
      </div>
      <StatusRow label="CORE TEMP" value="42°C" ok />
      <StatusRow label="NETWORK" value="NOMINAL" ok />
      <StatusRow label="POWER" value="STABLE" ok />
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
        <span className="font-mono-hud text-xs" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="hud-bar">
        <div className="hud-bar-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, rgba(0,212,255,0.5), ${color})` }} />
      </div>
    </div>
  )
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span className="font-mono-hud text-xs flex items-center gap-1" style={{ color: ok ? '#4cff91' : '#ff6b6b' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        {value}
      </span>
    </div>
  )
}

interface WeatherCardProps {
  data: { location: string; temperature: number; condition: string; humidity: number; wind_speed: number; icon: string } | null
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <div className="hud-card hud-corner p-4" style={{ borderRadius: 2 }}>
      <div className="font-hud text-xs mb-3" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>METEOROLOGY</div>
      {data ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: 32 }}>{data.icon}</span>
            <div>
              <div className="font-hud text-2xl font-bold glow" style={{ color: 'var(--cyan)' }}>{data.temperature}°C</div>
              <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>{data.condition}</div>
            </div>
          </div>
          <div className="font-mono-hud text-xs mb-2" style={{ color: 'var(--text-dim)' }}>📍 {data.location}</div>
          <div className="grid grid-cols-2 gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div>
              <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>HUMIDITY</div>
              <div className="font-mono-hud text-xs" style={{ color: 'var(--cyan)' }}>{data.humidity}%</div>
            </div>
            <div>
              <div className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)' }}>WIND</div>
              <div className="font-mono-hud text-xs" style={{ color: 'var(--cyan)' }}>{data.wind_speed} km/h</div>
            </div>
          </div>
        </>
      ) : (
        <div className="font-mono-hud text-xs animate-pulse" style={{ color: 'var(--text-dim)' }}>FETCHING DATA...</div>
      )}
    </div>
  )
}

export function CameraCard() {
  return (
    <div className="hud-card hud-corner p-4" style={{ borderRadius: 2 }}>
      <div className="font-hud text-xs mb-3" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>SURVEILLANCE</div>
      <div className="relative" style={{ background: '#000', border: '1px solid var(--border)', aspectRatio: '4/3', borderRadius: 1, overflow: 'hidden' }}>
        {/* Fake camera feed with animated noise */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl" style={{ filter: 'grayscale(1) opacity(0.3)' }}>📷</div>
        </div>
        <div className="absolute inset-0" style={{
          background: `repeating-linear-gradient(0deg, rgba(0,212,255,0.03) 0px, rgba(0,212,255,0.03) 1px, transparent 1px, transparent 3px)`,
        }} />
        {/* Scanline */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
          animation: 'scanline-move 3s linear infinite',
        }} />
        <div className="absolute top-1 left-1 font-mono-hud text-xs" style={{ color: 'var(--cyan)', fontSize: 8 }}>REC ●</div>
        <div className="absolute top-1 right-1 font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 8 }}>CAM-01</div>
        <div className="absolute bottom-1 left-1 font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 7 }}>NO THREATS DETECTED</div>
      </div>
    </div>
  )
}

interface UptimeCardProps {
  uptime: number
}

export function UptimeCard({ uptime }: UptimeCardProps) {
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = uptime % 60

  const blocks = [
    { label: 'DAYS', value: days },
    { label: 'HRS', value: hours },
    { label: 'MIN', value: minutes },
    { label: 'SEC', value: seconds },
  ]

  return (
    <div className="hud-card hud-corner p-4" style={{ borderRadius: 2 }}>
      <div className="font-hud text-xs mb-3" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>UPTIME COUNTER</div>
      <div className="grid grid-cols-4 gap-2">
        {blocks.map(({ label, value }) => (
          <div key={label} className="text-center" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border)', padding: '6px 4px', borderRadius: 1 }}>
            <div className="font-hud text-lg font-bold glow" style={{ color: 'var(--cyan)' }}>{String(value).padStart(2, '0')}</div>
            <div className="font-mono-hud" style={{ color: 'var(--text-dim)', fontSize: 8, letterSpacing: '0.1em' }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)', fontSize: 9 }}>SYSTEM STABLE</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
    </div>
  )
}
