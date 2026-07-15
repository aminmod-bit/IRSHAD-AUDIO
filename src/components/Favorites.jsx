import { useMemo } from 'react'
import { formatTime } from '../utils'

export default function Favorites({ playlists, favorites, onToggleFav, onPlayTrack, currentTrack }) {
  const favTracks = useMemo(() => {
    return playlists.flatMap(pl => pl.tracks.map(t => ({ ...t, cover: pl.cover, color: pl.color }))).filter(t => favorites.includes(t.id))
  }, [playlists, favorites])

  return (
    <div className="page">
      <h1 style={{fontFamily:'var(--font-serif)',fontSize:36,fontWeight:400,fontStyle:'italic',marginBottom:24}}>Избранное</h1>
      {favTracks.length === 0 ? (
        <div className="empty">Нет избранных треков</div>
      ) : (
        <div className="track-list">
          {favTracks.map((t, i) => (
            <div key={t.id} className={`track-item ${currentTrack?.id === t.id ? 'playing' : ''}`} onClick={() => onPlayTrack(t, favTracks)}>
              <span className="track-num">{i + 1}</span>
              <div className="track-cover" style={{background:`linear-gradient(135deg, ${t.color}50, ${t.color}20)`}}>
                {t.cover}
              </div>
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-author">{t.author}</div>
              </div>
              <span className="track-dur">{formatTime(t.duration)}</span>
              <button className="track-fav on" onClick={(e) => { e.stopPropagation(); onToggleFav(t.id) }}>❤️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
