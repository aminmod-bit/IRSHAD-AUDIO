import { formatTime } from '../utils'
import { ChevronLeft, Heart, HeartFill } from './Icons'

export default function PlaylistDetail({ playlist, onBack, onPlayTrack, currentTrack, playing, favorites, onToggleFav }) {
  if (!playlist) return <div className="empty">Плейлист не найден</div>
  return (
    <div className="page">
      <button onClick={onBack} style={{fontSize:13,color:'var(--color-text-muted)',marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
        <ChevronLeft size={16} /> Назад
      </button>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
        <div style={{width:80,height:80,borderRadius:'var(--radius-lg)',background:`linear-gradient(135deg, ${playlist.color}60, ${playlist.color}20)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>
          {playlist.cover}
        </div>
        <div>
          <h1 style={{fontFamily:'var(--font-serif)',fontSize:28,fontWeight:400,fontStyle:'italic'}}>{playlist.title}</h1>
          <div style={{fontSize:13,color:'var(--color-text-muted)',marginTop:4}}>{playlist.tracks.length} аудио уроков</div>
        </div>
      </div>
      <div className="track-list">
        {playlist.tracks.map((t, i) => (
          <div key={t.id} className={`track-item ${currentTrack?.id === t.id ? 'playing' : ''}`} onClick={() => onPlayTrack(t, playlist.tracks)}>
            <span className="track-num">{i + 1}</span>
            <div className="track-cover" style={{background:`linear-gradient(135deg, ${playlist.color}50, ${playlist.color}20)`}}>
              {playlist.cover}
            </div>
            <div className="track-info">
              <div className="track-title">{t.title}</div>
              <div className="track-author">{t.author}</div>
            </div>
            <span className="track-dur">{formatTime(t.duration)}</span>
            <button className={`track-fav ${favorites.includes(t.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFav(t.id) }}>
              {favorites.includes(t.id) ? <HeartFill size={14} /> : <Heart size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
