import { formatTime } from '../utils'

export default function FullPlayer({
  currentTrack, playing, toggle, prev, next, seek, progress, duration, pct,
  speed, setSpeed, volume, setVolume, repeat, setRepeat, onClose, queue, queueIdx
}) {
  if (!currentTrack) return null
  const speeds = [0.75, 1, 1.25, 1.5, 2]

  return (
    <>
      <div className="pl-overlay" onClick={onClose} />
      <div className="pl-full">
        <button className="pl-full-close" onClick={onClose}>✕</button>
        <div className="pl-full-cover" style={{background: currentTrack.color ? `linear-gradient(135deg, ${currentTrack.color}80, ${currentTrack.color}30)` : 'var(--color-surface)'}}>
          {currentTrack.cover || '🎵'}
        </div>
        <div className="pl-full-title">{currentTrack.title}</div>
        <div className="pl-full-author">{currentTrack.author}</div>
        <div className="pl-full-bar" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration) }}>
          <div className="pl-full-track">
            <div className="pl-full-fill" style={{width:`${pct}%`}} />
          </div>
          <div className="pl-full-times">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="pl-full-ctrls">
          <button className="pl-full-btn" style={{fontSize:14,color:repeat!=='off'?'var(--color-accent)':'var(--color-text-muted)'}} onClick={() => setRepeat(repeat==='off'?'all':repeat==='all'?'one':'off')}>
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
          <button className="pl-full-btn" onClick={() => seek(Math.max(0, progress - 10))}>-10</button>
          <button className="pl-full-btn" onClick={prev}>⏮</button>
          <button className="pl-full-btn play" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <button className="pl-full-btn" onClick={next}>⏭</button>
          <button className="pl-full-btn" onClick={() => seek(Math.min(duration, progress + 10))}>+10</button>
        </div>
        <div className="pl-full-bottom">
          <div className="pl-vol">
            <span className="pl-vol-icon" onClick={() => setVolume(v => v > 0 ? 0 : 1)}>{volume === 0 ? '🔇' : '🔊'}</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="pl-vol-slider" />
          </div>
          <div style={{display:'flex',gap:4}}>
            {speeds.map(s => (
              <button key={s} className={`chip ${speed === s ? 'on' : ''}`} style={{padding:'4px 10px',fontSize:12}} onClick={() => setSpeed(s)}>{s}x</button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
