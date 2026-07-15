import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { formatTime } from './utils.js'

export default function App() {
  const [tracks, setTracks] = useState([])
  const [view, setView] = useState('home')
  const [query, setQuery] = useState('')
  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueIdx, setQueueIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_vol')) ?? 1 } catch { return 1 } })
  const [speed, setSpeed] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_spd')) ?? 1 } catch { return 1 } })
  const [repeat, setRepeat] = useState('off')
  const [expanded, setExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_fav')) ?? [] } catch { return [] } })
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_hist')) ?? [] } catch { return [] } })
  const [selectedGenre, setSelectedGenre] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => { fetch('./data/tracks.json').then(r => r.json()).then(setTracks).catch(() => {}) }, [])

  useEffect(() => { try { localStorage.setItem('ir_vol', JSON.stringify(volume)) } catch {} }, [volume])
  useEffect(() => { try { localStorage.setItem('ir_spd', JSON.stringify(speed)) } catch {} }, [speed])
  useEffect(() => { try { localStorage.setItem('ir_fav', JSON.stringify(favorites)) } catch {} }, [favorites])
  useEffect(() => { try { localStorage.setItem('ir_hist', JSON.stringify(history)) } catch {} }, [history])

  useEffect(() => {
    const a = new Audio()
    audioRef.current = a
    a.preload = 'metadata'
    a.addEventListener('timeupdate', () => setProgress(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(a.duration))
    a.addEventListener('ended', () => {
      if (repeat === 'one') { a.currentTime = 0; a.play().catch(() => {}) }
      else if (repeat === 'all' || queueIdx < queue.length - 1) {
        const next = repeat === 'all' && queueIdx >= queue.length - 1 ? 0 : queueIdx + 1
        setQueueIdx(next)
      } else setPlaying(false)
    })
    return () => { a.pause(); a.src = '' }
  }, [repeat, queueIdx, queue.length])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed }, [speed])

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.src || ''
      if (playing) audioRef.current.play().catch(() => {})
    }
  }, [currentTrack?.id])

  const play = useCallback((track, list) => {
    const q = list || tracks
    setQueue(q)
    const idx = q.findIndex(t => t.id === track.id)
    setQueueIdx(idx >= 0 ? idx : 0)
    setCurrentTrack(track)
    setPlaying(true)
    setHistory(h => {
      const next = h.filter(x => x.id !== track.id)
      next.unshift({ id: track.id, title: track.title, author: track.author, cover: track.cover, ts: Date.now() })
      return next.slice(0, 100)
    })
  }, [tracks])

  const toggle = useCallback(() => {
    if (!audioRef.current || !currentTrack) return
    if (playing) audioRef.current.pause(); else audioRef.current.play().catch(() => {})
    setPlaying(!playing)
  }, [playing, currentTrack])

  const seek = useCallback((t) => { if (audioRef.current) { audioRef.current.currentTime = t; setProgress(t) } }, [])
  const next = useCallback(() => { if (queue.length && (repeat === 'all' || queueIdx < queue.length - 1)) setQueueIdx((queueIdx + 1) % queue.length) }, [queueIdx, queue.length, repeat])
  const prev = useCallback(() => { if (queue.length) { if (progress > 3) seek(0); else if (queueIdx > 0) setQueueIdx(queueIdx - 1) } }, [queueIdx, progress, queue.length])
  const toggleFav = useCallback((id) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]), [])

  const genres = useMemo(() => [...new Set(tracks.map(t => t.genre))], [tracks])
  const filtered = useMemo(() => {
    let list = tracks
    if (selectedGenre) list = list.filter(t => t.genre === selectedGenre)
    if (query.trim()) { const q = query.toLowerCase(); list = list.filter(t => t.title.toLowerCase().includes(q) || t.author.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)) }
    return list
  }, [tracks, query, selectedGenre])

  const playAll = useCallback(() => { if (filtered.length) play(filtered[0], filtered) }, [filtered, play])
  const togglePlay = useCallback((e, t) => { e.stopPropagation(); if (currentTrack?.id === t.id) toggle(); else play(t, filtered) }, [currentTrack, play, toggle, filtered])

  const nav = [
    { id: 'home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Главная' },
    { id: 'search', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: 'Поиск' },
    { id: 'library', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>, label: 'Библиотека' },
    { id: 'favorites', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, label: 'Избранное' },
    { id: 'later', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Слушать позже' },
    { id: 'admin', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, label: 'Админ' },
  ]

  const pct = duration > 0 ? (progress / duration) * 100 : 0
  const speeds = [0.75, 1, 1.25, 1.5, 2]

  const lastTrack = history.length > 0 ? history[0] : null
  const albumTracks = tracks.filter(t => t.album === 'Открытие Палестины')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-header">
          <div className="sb-logo" onClick={() => setView('home')}>
            <div className="sb-logo-icon">
              <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
                <circle cx="256" cy="180" r="80" fill="#f0d060"/>
                <circle cx="290" cy="160" r="65" fill="#1a7a3a"/>
              </svg>
            </div>
            <div className="sb-logo-text">
              <span className="sb-logo-title">IRSHAD</span>
              <span className="sb-logo-sub">AUDIO</span>
            </div>
          </div>
          <div className="sb-actions">
            <button className="sb-btn">RU</button>
            <button className="sb-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </div>
        <nav className="sb-nav">
          {nav.map(n => (
            <button key={n.id} className={`sb-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)}>
              <span className="sb-icon">{n.icon}</span>
              <span className="sb-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="main-scroll">
          {view === 'home' && (
            <div className="page fade">
              <h1 className="hero-heading">Знание прежде <em>слов и дел</em></h1>

              <div className="hero-card">
                <div className="hc-left">
                  <h2 className="hc-title">Люди нуждаются в знании больше, чем в <em>еде и питье.</em></h2>
                  <p className="hc-desc">Все уроки в одном месте — слушай, сохраняй и продолжай изучение в удобное время.</p>
                  <button className="btn-green" onClick={() => play(tracks[0])}>▶ Продолжить</button>
                </div>
                <div className="hc-albums">
                  {albumTracks.slice(0, 3).map((t, i) => (
                    <div key={t.id} className="album-card" onClick={() => play(t, albumTracks)}>
                      <div className="ac-cover">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="20" height="20" rx="3" fill="#4ade80" opacity="0.8"/><rect x="12" y="4" width="20" height="20" rx="3" fill="#22c55e" opacity="0.9"/><rect x="8" y="12" width="20" height="20" rx="3" fill="#16a34a"/></svg>
                      </div>
                      <div className="ac-info">
                        <span className="ac-title">{String(i + 1).padStart(2, '0')} {t.title.length > 14 ? t.title.slice(0, 14) + '...' : t.title}</span>
                        <span className="ac-author">{t.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hc-art">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none"><rect x="10" y="20" width="60" height="60" rx="8" fill="#4ade80" opacity="0.7"/><rect x="30" y="10" width="60" height="60" rx="8" fill="#22c55e" opacity="0.85"/><rect x="20" y="35" width="60" height="60" rx="8" fill="#16a34a"/></svg>
                </div>
              </div>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Продолжить прослушивание</h2></div>
                {lastTrack ? (
                  <div className="resume-card" onClick={() => { const t = tracks.find(x => x.id === lastTrack.id); if (t) play(t) }}>
                    <div className="rc-cover">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <div className="rc-info">
                      <div className="rc-title">{lastTrack.title}</div>
                      <div className="rc-author">{lastTrack.author}</div>
                      <div className="rc-progress">
                        <div className="rc-bar"><div className="rc-fill" style={{ width: '1%' }} /></div>
                        <span className="rc-time">1% · {formatTime(tracks.find(x => x.id === lastTrack.id)?.duration || 0)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">Начните прослушивание</div>
                )}
              </section>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Популярное</h2><button className="sec-more">Посмотреть все</button></div>
                <div className="track-grid">
                  {tracks.slice(0, 6).map(t => (
                    <div key={t.id} className={`tk ${currentTrack?.id === t.id ? 'playing' : ''}`} onClick={() => play(t)}>
                      <div className="tk-cover">{t.cover}</div>
                      <div className="tk-info">
                        <div className="tk-title">{t.title}</div>
                        <div className="tk-author">{t.author}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Жанры</h2></div>
                <div className="genre-chips">
                  {genres.map(g => (
                    <button key={g} className="chip" onClick={() => { setSelectedGenre(g); setView('search') }}>{g}</button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {view === 'search' && (
            <div className="page fade">
              <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search-input" placeholder="Поиск уроков, авторов..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                {query && <button className="search-x" onClick={() => setQuery('')}>✕</button>}
              </div>
              {selectedGenre && <div className="genre-chips"><button className="chip on" onClick={() => setSelectedGenre(null)}>{selectedGenre} ✕</button></div>}
              {!selectedGenre && !query && (
                <div className="genre-chips">
                  {genres.map(g => <button key={g} className="chip" onClick={() => setSelectedGenre(g)}>{g}</button>)}
                </div>
              )}
              <div className="track-list">
                {filtered.map((t, i) => (
                  <div key={t.id} className={`tl ${currentTrack?.id === t.id ? 'play' : ''}`} onClick={() => play(t, filtered)}>
                    <span className="tl-n">{i + 1}</span>
                    <span className="tl-cover">{t.cover}</span>
                    <div className="tl-info"><div className="tl-title">{t.title}</div><div className="tl-author">{t.author} · {t.album}</div></div>
                    <span className="tl-dur">{formatTime(t.duration)}</span>
                    <button className={`tl-fav ${favorites.includes(t.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFav(t.id) }}>{favorites.includes(t.id) ? '❤️' : '🤍'}</button>
                  </div>
                ))}
                {filtered.length === 0 && <div className="empty">Ничего не найдено</div>}
              </div>
            </div>
          )}

          {view === 'library' && (
            <div className="page fade">
              <h2 className="page-h">Библиотека</h2>
              <div className="genre-grid">
                {genres.map(g => (
                  <div key={g} className="genre-card" onClick={() => { setSelectedGenre(g); setView('search') }}>
                    <span className="gc-icon">{tracks.find(t => t.genre === g)?.cover}</span>
                    <div className="gc-info"><span className="gc-name">{g}</span><span className="gc-count">{tracks.filter(t => t.genre === g).length} уроков</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'favorites' && (
            <div className="page fade">
              <h2 className="page-h">Избранное</h2>
              <div className="track-list">
                {favorites.length === 0 ? <div className="empty">Нет избранных треков</div> : (
                  tracks.filter(t => favorites.includes(t.id)).map((t, i) => (
                    <div key={t.id} className={`tl ${currentTrack?.id === t.id ? 'play' : ''}`} onClick={() => play(t)}>
                      <span className="tl-n">{i + 1}</span>
                      <span className="tl-cover">{t.cover}</span>
                      <div className="tl-info"><div className="tl-title">{t.title}</div><div className="tl-author">{t.author}</div></div>
                      <span className="tl-dur">{formatTime(t.duration)}</span>
                      <button className="tl-fav on" onClick={(e) => { e.stopPropagation(); toggleFav(t.id) }}>❤️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === 'later' && (
            <div className="page fade">
              <h2 className="page-h">Слушать позже</h2>
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p>Список пуст</p>
              </div>
            </div>
          )}

          {view === 'admin' && (
            <div className="page fade">
              <h2 className="page-h">Админ</h2>
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p>Панель администратора</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {currentTrack && (
        <div className="player-wrap">
          {expanded && <div className="pl-overlay" onClick={() => setExpanded(false)} />}
          {expanded && (
            <div className="pl-full">
              <button className="pl-close" onClick={() => setExpanded(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className="pl-cover-lg">{currentTrack.cover}</div>
              <div className="pl-title-lg">{currentTrack.title}</div>
              <div className="pl-author-lg">{currentTrack.author}</div>
              <div className="pl-bar-wrap" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration) }}>
                <div className="pl-bar"><div className="pl-fill" style={{ width: `${pct}%` }} /><div className="pl-dot" style={{ left: `${pct}%` }} /></div>
                <div className="pl-times"><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
              </div>
              <div className="pl-ctrls">
                <button className="pc" onClick={() => seek(Math.max(0, progress - 10))}>-10</button>
                <button className="pc" onClick={prev}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button className="pc big" onClick={toggle}>
                  {playing ? <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> : <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                </button>
                <button className="pc" onClick={next}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
                <button className="pc" onClick={() => seek(Math.min(duration, progress + 10))}>+10</button>
              </div>
              <div className="pl-bottom">
                <button className={`pc sm ${repeat !== 'off' ? 'on' : ''}`} onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                </button>
                <div className="speed-opts">
                  {speeds.map(s => <button key={s} className={`sp ${speed === s ? 'on' : ''}`} onClick={() => setSpeed(s)}>{s}x</button>)}
                </div>
                <div className="vol-wrap">
                  <button className="vol-ic" onClick={() => setVolume(v => v > 0 ? 0 : 1)}>
                    {volume === 0 ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>}
                  </button>
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="vol-slider" />
                </div>
              </div>
            </div>
          )}
          <div className="pl-mini" onClick={() => setExpanded(true)}>
            <div className="pl-mini-bar"><div className="pl-mini-fill" style={{ width: `${pct}%` }} /></div>
            <div className="pl-mini-inner">
              <div className="pl-mini-cover">{currentTrack.cover}</div>
              <div className="pl-mini-info">
                <div className="pl-mini-title">{currentTrack.title}</div>
                <div className="pl-mini-author">{currentTrack.author}</div>
              </div>
              <div className="pl-mini-ctrls">
                <button className="pmc" onClick={e => { e.stopPropagation(); prev() }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button className="pmc play" onClick={e => { e.stopPropagation(); toggle() }}>
                  {playing ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                </button>
                <button className="pmc" onClick={e => { e.stopPropagation(); next() }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
              </div>
              <div className="pl-mini-time">{formatTime(progress)} · {formatTime(duration)}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="bnav">
        {nav.slice(0, 5).map(n => (
          <button key={n.id} className={`bnav-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)}>
            <span className="bnav-ic">{n.icon}</span>
            <span className="bnav-lb">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
