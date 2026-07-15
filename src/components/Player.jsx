import { formatTime } from '../utils'

export default function Player({
  currentTrack, playing, toggle, prev, next, seek, progress, duration, pct,
  speed, setSpeed, volume, setVolume, repeat, setRepeat, onExpand, showQueue, setShowQueue
}) {
  if (!currentTrack) return null
  const speeds = [0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="player-wrap">
      <div className="pl-bar-top">
        <div className="pl-bar-fill" style={{width:`${pct}%`}} />
      </div>
      <div className="pl-dock">
        <div className="pl-cover">{currentTrack.cover || '🎵'}</div>
        <div className="pl-info" onClick={onExpand} style={{cursor:'pointer'}}>
          <div className="pl-title">{currentTrack.title}</div>
          <div className="pl-author">{currentTrack.author}</div>
        </div>
        <div className="pl-controls">
          <button className="pl-btn" onClick={() => seek(Math.max(0, progress - 10))}>-10</button>
          <button className="pl-btn" onClick={prev}>⏮</button>
          <button className="pl-btn play" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <button className="pl-btn" onClick={next}>⏭</button>
          <button className="pl-btn" onClick={() => seek(Math.min(duration, progress + 10))}>+10</button>
        </div>
        <div className="pl-right">
          <span className="pl-time">{formatTime(progress)}</span>
          <div className="pl-progress" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration) }}>
            <div className="pl-progress-fill" style={{width:`${pct}%`}} />
          </div>
          <span className="pl-time">{formatTime(duration)}</span>
          <button className={`pl-btn ${repeat !== 'off' ? '' : ''}`} style={{fontSize:14,color:repeat!=='off'?'var(--color-accent)':'var(--color-text-muted)'}} onClick={() => setRepeat(repeat==='off'?'all':repeat==='all'?'one':'off')}>
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
          <span className="pl-speed" onClick={() => setSpeed(speeds[(speeds.indexOf(speed) + 1) % speeds.length])}>{speed}x</span>
          <div className="pl-vol">
            <span className="pl-vol-icon" onClick={() => setVolume(v => v > 0 ? 0 : 1)}>{volume === 0 ? '🔇' : '🔊'}</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="pl-vol-slider" />
          </div>
          <button className="pl-btn" style={{fontSize:14}} onClick={() => setShowQueue(!showQueue)}>☰</button>
        </div>
      </div>
    </div>
  )
}
