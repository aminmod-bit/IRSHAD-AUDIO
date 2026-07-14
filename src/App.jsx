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
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'search', icon: '🔍', label: 'Поиск' },
    { id: 'library', icon: '📚', label: 'Библиотека' },
    { id: 'ai', icon: '🤖', label: 'AI Плейлист' },
    { id: 'rooms', icon: '👥', label: 'Комнаты' },
    { id: 'profile', icon: '👤', label: 'Профиль' },
  ]

  const pct = duration > 0 ? (progress / duration) * 100 : 0
  const speeds = [0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo" onClick={() => setView('home')}>
          <div className="sb-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c1.6 0 3.1-.4 4.4-1.1C13.2 18.8 10 15.7 10 12s3.2-6.8 6.4-7.9C15.1 3.4 13.6 3 12 3z" fill="#f0d060"/>
              <circle cx="17" cy="7" r="1.8" fill="#f0d060" opacity="0.9"/>
            </svg>
          </div>
          <div className="sb-logo-text">IRSHAD</div>
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
              <div className="hero">
                <div className="hero-inner">
                  <div className="hero-badge">🕌 Исламская аудио библиотека</div>
                  <h1 className="hero-title">Исламские аудиоуроки<br/>в удобном формате</h1>
                  <p className="hero-desc">Слушайте лекции учёных, толкования Корана, хадисы и нашиды. Удобный плеер с сохранением прогресса.</p>
                  <div className="hero-btns">
                    <button className="btn-g" onClick={() => { setView('search'); setSelectedGenre(null) }}>▶ Слушать уроки</button>
                    <button className="btn-o" onClick={() => setView('library')}>📚 Каталог</button>
                  </div>
                  <div className="hero-stats">
                    <div className="hs"><span className="hs-n">10</span><span className="hs-l">Серий</span></div>
                    <div className="hs"><span className="hs-n">30</span><span className="hs-l">Уроков</span></div>
                    <div className="hs"><span className="hs-n">8</span><span className="hs-l">Тем</span></div>
                  </div>
                </div>
              </div>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Жанры</h2></div>
                <div className="genre-grid">
                  {genres.map(g => (
                    <div key={g} className="genre-card" onClick={() => { setSelectedGenre(g); setView('search') }}>
                      <span className="gc-icon">{tracks.find(t => t.genre === g)?.cover}</span>
                      <span className="gc-name">{g}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Популярное</h2></div>
                <div className="track-grid">
                  {tracks.slice(0, 10).map(t => (
                    <div key={t.id} className={`tk ${currentTrack?.id === t.id ? 'play' : ''}`} onClick={() => play(t)}>
                      <div className="tk-cover">{t.cover}</div>
                      <div className="tk-title">{t.title}</div>
                      <div className="tk-author">{t.author}</div>
                      <button className="tk-play" onClick={(e) => togglePlay(e, t)}>{currentTrack?.id === t.id && playing ? '⏸' : '▶'}</button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="sec">
                <div className="sec-h"><h2 className="sec-t">Недавние</h2></div>
                <div className="track-list">
                  {tracks.slice(10, 20).map((t, i) => (
                    <div key={t.id} className={`tl ${currentTrack?.id === t.id ? 'play' : ''}`} onClick={() => play(t, tracks.slice(10, 20))}>
                      <span className="tl-n">{i + 1}</span>
                      <span className="tl-cover">{t.cover}</span>
                      <div className="tl-info"><div className="tl-title">{t.title}</div><div className="tl-author">{t.author}</div></div>
                      <span className="tl-dur">{formatTime(t.duration)}</span>
                      <button className={`tl-fav ${favorites.includes(t.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFav(t.id) }}>{favorites.includes(t.id) ? '❤️' : '🤍'}</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {view === 'search' && (
            <div className="page fade">
              <div className="search-bar">
                <span className="sb-s">🔍</span>
                <input className="search-input" placeholder="Поиск уроков, авторов..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                {query && <button className="search-x" onClick={() => setQuery('')}>✕</button>}
              </div>
              {!query && !selectedGenre && (
                <div className="genre-chips">
                  <button className={`chip ${!selectedGenre ? 'on' : ''}`} onClick={() => setSelectedGenre(null)}>Все</button>
                  {genres.map(g => <button key={g} className={`chip ${selectedGenre === g ? 'on' : ''}`} onClick={() => setSelectedGenre(g)}>{g}</button>)}
                </div>
              )}
              {selectedGenre && <div className="genre-chips"><button className="chip on" onClick={() => setSelectedGenre(null)}>{selectedGenre} ✕</button></div>}
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
              <h2 className="page-h">Каталог</h2>
              <div className="genre-grid full">
                {genres.map(g => (
                  <div key={g} className="genre-card big" onClick={() => { setSelectedGenre(g); setView('search') }}>
                    <span className="gc-icon">{tracks.find(t => t.genre === g)?.cover}</span>
                    <div className="gc-info"><span className="gc-name">{g}</span><span className="gc-count">{tracks.filter(t => t.genre === g).length} уроков</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'ai' && (
            <div className="page fade">
              <h2 className="page-h">AI Плейлист</h2>
              <div className="ai-box">
                <div className="ai-icon">🤖</div>
                <div className="ai-title">Умный подбор аудио</div>
                <div className="ai-desc">AI анализирует ваши предпочтения и создает персональный плейлист из исламских аудиоуроков</div>
                <button className="btn-g" onClick={() => { setSelectedGenre(null); play(tracks[0]) }}>Создать плейлист</button>
              </div>
            </div>
          )}

          {view === 'rooms' && (
            <div className="page fade">
              <h2 className="page-h">Комнаты</h2>
              <div className="rooms-grid">
                {['Общий зал', 'Тихое прослушивание', 'Обсуждение', 'Новички'].map((r, i) => (
                  <div key={i} className="room-card">
                    <div className="room-icon">👥</div>
                    <div className="room-name">{r}</div>
                    <div className="room-count">{Math.floor(Math.random() * 50) + 5} слушателей</div>
                    <button className="btn-o sm">Войти</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="page fade">
              <h2 className="page-h">Профиль</h2>
              <div className="profile-card">
                <div className="pc-avatar">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c1.6 0 3.1-.4 4.4-1.1C13.2 18.8 10 15.7 10 12s3.2-6.8 6.4-7.9C15.1 3.4 13.6 3 12 3z" fill="#f0d060"/>
                    <circle cx="17" cy="7" r="1.8" fill="#f0d060" opacity="0.9"/>
                  </svg>
                </div>
                <div className="pc-name">Слушатель</div>
                <div className="pc-sub">IRSHAD</div>
              </div>
              <div className="profile-stats">
                <div className="ps"><span className="ps-n">{favorites.length}</span><span className="ps-l">Избранное</span></div>
                <div className="ps"><span className="ps-n">{history.length}</span><span className="ps-l">Прослушано</span></div>
              </div>
              <div className="sec">
                <div className="sec-h"><h2 className="sec-t">История</h2></div>
                {history.length === 0 ? <div className="empty">История пуста</div> : (
                  <div className="track-list">
                    {history.slice(0, 10).map((h, i) => (
                      <div key={h.id + i} className="tl" onClick={() => { const t = tracks.find(x => x.id === h.id); if (t) play(t) }}>
                        <span className="tl-cover">{h.cover}</span>
                        <div className="tl-info"><div className="tl-title">{h.title}</div><div className="tl-author">{h.author}</div></div>
                        <span className="tl-dur">{new Date(h.ts).toLocaleDateString('ru')}</span>
                      </div>
                    ))}
                  </div>
                )}
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
              <button className="pl-close" onClick={() => setExpanded(false)}>▾</button>
              <div className="pl-cover-lg">{currentTrack.cover}</div>
              <div className="pl-title-lg">{currentTrack.title}</div>
              <div className="pl-author-lg">{currentTrack.author}</div>
              <div className="pl-bar-wrap" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration) }}>
                <div className="pl-bar"><div className="pl-fill" style={{ width: `${pct}%` }} /><div className="pl-dot" style={{ left: `${pct}%` }} /></div>
                <div className="pl-times"><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
              </div>
              <div className="pl-ctrls">
                <button className={`pc ${repeat !== 'off' ? 'on' : ''}`} onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}>{repeat === 'one' ? '🔂' : '🔁'}</button>
                <button className="pc" onClick={prev}>⏮</button>
                <button className="pc big" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
                <button className="pc" onClick={next}>⏭</button>
                <button className="pc" onClick={() => setShowQueue(!showQueue)}>☰</button>
              </div>
              <div className="pl-bottom">
                <div className="speed-wrap">
                  <span className="speed-lbl">Скорость</span>
                  <div className="speed-opts">
                    {speeds.map(s => <button key={s} className={`sp ${speed === s ? 'on' : ''}`} onClick={() => setSpeed(s)}>{s}x</button>)}
                  </div>
                </div>
                <div className="vol-wrap">
                  <span className="vol-ic" onClick={() => setVolume(v => v > 0 ? 0 : 1)}>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="vol-slider" />
                </div>
              </div>
              {showQueue && (
                <div className="q-panel">
                  <div className="q-h">Очередь ({queue.length})</div>
                  <div className="q-list">
                    {queue.map((t, i) => (
                      <div key={t.id} className={`q-item ${i === queueIdx ? 'on' : ''}`}>
                        <span className="q-n">{i + 1}</span>
                        <span className="q-ic">{t.cover}</span>
                        <div className="q-info"><div className="q-name">{t.title}</div><div className="q-author">{t.author}</div></div>
                        <span className="q-dur">{formatTime(t.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="pl-mini" onClick={() => setExpanded(true)}>
            <div className="pl-mini-bar"><div className="pl-mini-fill" style={{ width: `${pct}%` }} /></div>
            <div className="pl-mini-inner">
              <div className="pl-mini-cover">{currentTrack.cover}</div>
              <div className="pl-mini-info"><div className="pl-mini-title">{currentTrack.title}</div><div className="pl-mini-author">{currentTrack.author}</div></div>
              <div className="pl-mini-ctrls">
                <button className="pmc" onClick={e => { e.stopPropagation(); prev() }}>⏮</button>
                <button className="pmc play" onClick={e => { e.stopPropagation(); toggle() }}>{playing ? '⏸' : '▶'}</button>
                <button className="pmc" onClick={e => { e.stopPropagation(); next() }}>⏭</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bnav">
        {nav.map(n => (
          <button key={n.id} className={`bnav-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)}>
            <span className="bnav-ic">{n.icon}</span>
            <span className="bnav-lb">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
