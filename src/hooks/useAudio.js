import { useState, useRef, useEffect, useCallback } from 'react'

export function useAudio() {
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueIdx, setQueueIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_vol')) ?? 1 } catch { return 1 } })
  const [speed, setSpeed] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_spd')) ?? 1 } catch { return 1 } })
  const [repeat, setRepeat] = useState('off')
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_fav')) ?? [] } catch { return [] } })
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('ir_hist')) ?? [] } catch { return [] } })
  const audioRef = useRef(null)

  useEffect(() => {
    Promise.all([
      fetch('./data/playlists.json').then(r => r.json()).catch(() => []),
    ]).then(([p]) => {
      setPlaylists(p)
      const allTracks = p.flatMap(pl => pl.tracks.map(t => ({ ...t, playlistId: pl.id, playlistTitle: pl.title, cover: pl.cover })))
      setTracks(allTracks)
    })
  }, [])

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
      if (playing && currentTrack.src) audioRef.current.play().catch(() => {})
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
      next.unshift({ id: track.id, title: track.title, author: track.author, ts: Date.now() })
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

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return {
    tracks, playlists, currentTrack, queue, queueIdx, playing,
    progress, duration, volume, speed, repeat, favorites, history, pct,
    play, toggle, seek, next, prev, toggleFav,
    setVolume, setSpeed, setRepeat, setQueue, setQueueIdx
  }
}
