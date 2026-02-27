import { useEffect, useRef } from 'react'

interface RadarProps {
  status: string
}

const BLIPS = [
  { r: 45, angle: 30, label: 'TGT-01' },
  { r: 70, angle: 140, label: 'TGT-02' },
  { r: 55, angle: 220, label: 'TGT-03' },
  { r: 80, angle: 310, label: 'FRD-01' },
]

export default function Radar({ status }: RadarProps) {
  const sweepRef = useRef<SVGLineElement>(null)
  const cx = 130, cy = 130, maxR = 110

  const blipPositions = BLIPS.map(b => ({
    ...b,
    x: cx + b.r * Math.cos((b.angle * Math.PI) / 180),
    y: cy + b.r * Math.sin((b.angle * Math.PI) / 180),
  }))

  return (
    <div className="flex flex-col items-center">
      {/* Status badge */}
      <div className="font-hud text-xs mb-3 flex items-center gap-2" style={{ color: 'var(--cyan)', letterSpacing: '0.2em' }}>
        <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse" />
        {status}
      </div>

      <svg width="260" height="260" viewBox="0 0 260 260" className="animate-flicker">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,20,35,0)" />
          </radialGradient>
          <radialGradient id="sweepGrad" cx="50%" cy="100%" r="80%" fx="50%" fy="100%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.6)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0)" />
          </radialGradient>
          <mask id="radarMask">
            <circle cx={cx} cy={cy} r={maxR} fill="white" />
          </mask>
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cy} r={maxR} fill="url(#radarBg)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />

        {/* Rings */}
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={maxR * f} fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* Crosshairs */}
        <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
        <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
        <line x1={cx - maxR * 0.7} y1={cy - maxR * 0.7} x2={cx + maxR * 0.7} y2={cy + maxR * 0.7} stroke="rgba(0,212,255,0.07)" strokeWidth="1" />
        <line x1={cx + maxR * 0.7} y1={cy - maxR * 0.7} x2={cx - maxR * 0.7} y2={cy + maxR * 0.7} stroke="rgba(0,212,255,0.07)" strokeWidth="1" />

        {/* Sweep */}
        <g mask="url(#radarMask)">
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'radar-sweep 4s linear infinite' }}>
            <path
              d={`M ${cx} ${cy} L ${cx + maxR} ${cy} A ${maxR} ${maxR} 0 0 0 ${cx + maxR * Math.cos(-Math.PI / 2)} ${cy + maxR * Math.sin(-Math.PI / 2)} Z`}
              fill="url(#sweepGrad)"
              opacity="0.7"
            />
            <line x1={cx} y1={cy} x2={cx + maxR} y2={cy} stroke="var(--cyan)" strokeWidth="1.5" opacity="0.9" />
          </g>
        </g>

        {/* Blips */}
        {blipPositions.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r="3" fill="var(--cyan)" opacity="0.9" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
            <text x={b.x + 6} y={b.y + 4} fontSize="6" fill="rgba(0,212,255,0.7)" fontFamily="'Share Tech Mono', monospace">{b.label}</text>
          </g>
        ))}

        {/* Center */}
        <circle cx={cx} cy={cy} r="4" fill="var(--cyan)" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
        <circle cx={cx} cy={cy} r="8" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.4" />

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={maxR + 5} fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={maxR + 10} fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1" />

        {/* Tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180
          const r1 = maxR + 5, r2 = maxR + (i % 9 === 0 ? 12 : 8)
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(angle)} y1={cy + r1 * Math.sin(angle)}
              x2={cx + r2 * Math.cos(angle)} y2={cy + r2 * Math.sin(angle)}
              stroke="rgba(0,212,255,0.5)" strokeWidth={i % 9 === 0 ? 1.5 : 0.5}
            />
          )
        })}

        {/* Cardinal labels */}
        {[['N', cx, cy - maxR - 20], ['S', cx, cy + maxR + 20], ['E', cx + maxR + 20, cy], ['W', cx - maxR - 20, cy]].map(([l, x, y], i) => (
          <text key={i} x={+x} y={+y} textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="rgba(0,212,255,0.5)" fontFamily="'Orbitron', sans-serif" fontWeight="700">
            {l}
          </text>
        ))}
      </svg>

      {/* Stats below radar */}
      <div className="flex gap-6 mt-2">
        {['RANGE: 200km', 'MODE: ACTIVE', 'FREQ: 9.4GHz'].map((s, i) => (
          <div key={i} className="font-mono-hud text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{s}</div>
        ))}
      </div>
    </div>
  )
}
