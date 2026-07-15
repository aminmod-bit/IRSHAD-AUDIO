import { useState, useMemo } from 'react'
import { formatTime } from '../utils'
import { Search as SearchIcon, Heart, HeartFill, X } from './Icons'

export default function Search({ playlists, onPlayTrack, currentTrack, favorites, onToggleFav }) {
  const [query, setQuery] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  const allTracks = useMemo(() =>
    playlists.flatMap(pl => pl.tracks.map(t => ({ ...t, playlistTitle: pl.title, cover: pl.cover, color: pl.color }))),
    [playlists]
  )

  const filtered = useMemo(() => {
    let list = allTracks
    if (selectedPlaylist) list = allTracks.filter(t => t.playlistId === selectedPlaylist)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.author.toLowerCase().includes(q))
    }
    return list
  }, [allTracks, query, selectedPlaylist])

  return (
    <div className="page">
      <h1 style={{fontFamily:'var(--font-serif)',fontSize:36,fontWeight:400,fontStyle:'italic',marginBottom:24}}>Поиск</h1>
      <div className="search-bar">
        <span style={{color:'var(--color-text-muted)'}}><SearchIcon size={16} /></span>
        <input className="search-input" placeholder="Поиск уроков, авторов..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        {query && <button style={{color:'var(--color-text-subtle)'}} onClick={() => setQuery('')}><X size={14} /></button>}
      </div>
      {selectedPlaylist && (
        <div className="chip-row" style={{marginBottom:16}}>
          <button className="chip on" onClick={() => setSelectedPlaylist(null)}>
            {playlists.find(p => p.id === selectedPlaylist)?.title} ✕
          </button>
        </div>
      )}
      {!selectedPlaylist && !query && (
        <div className="chip-row">
          {playlists.map(pl => (
            <button key={pl.id} className="chip" onClick={() => setSelectedPlaylist(pl.id)}>
              {pl.cover} {pl.title}
            </button>
          ))}
        </div>
      )}
      <div className="track-list">
        {filtered.map((t, i) => (
          <div key={t.id} className={`track-item ${currentTrack?.id === t.id ? 'playing' : ''}`} onClick={() => onPlayTrack(t, filtered)}>
            <span className="track-num">{i + 1}</span>
            <div className="track-cover" style={{background:`linear-gradient(135deg, ${t.color}50, ${t.color}20)`}}>
              {t.cover}
            </div>
            <div className="track-info">
              <div className="track-title">{t.title}</div>
              <div className="track-author">{t.author} · {t.playlistTitle}</div>
            </div>
            <span className="track-dur">{formatTime(t.duration)}</span>
            <button className={`track-fav ${favorites.includes(t.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFav(t.id) }}>
              {favorites.includes(t.id) ? <HeartFill size={14} /> : <Heart size={14} />}
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">Ничего не найдено</div>}
      </div>
    </div>
  )
}
